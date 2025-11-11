import { useEffect, useMemo, useState } from "react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatients,
  type Appointment,
  type Patient,
} from "../api/clients";
import AppointmentForm from "../components/AppointmentForm";

// Utilitaire pour afficher une date lisible
function formatDate(dt: string) {
  // dt est en ISO genre "2025-10-08T10:30:00Z"
  const d = new Date(dt);
  // Exemple: "08 oct. 2025 – 10:30"
  return d.toLocaleString("fr-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Appointments() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  // 🧠 Map patientId -> "Prénom Nom"
  const nameById = useMemo(() => {
    const m = new Map<number, string>();
    patients.forEach((p) => m.set(p.id, `${p.firstName} ${p.lastName}`));
    return m;
  }, [patients]);

  // 📦 Charger patients + rendez-vous au montage
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getPatients({ page: 1, pageSize: 200 }), getAppointments()])
      .then(([p, a]) => {
        setPatients(p.items ?? []);
        setItems(a);
      })
      .catch(() => setError("Impossible de charger les rendez-vous."))
      .finally(() => setLoading(false));
  }, []);

  // ➕ Création
  const onCreate = async (data: Omit<Appointment, "id">) => {
    try {
      const created = await createAppointment(data);
      setItems((prev) => [created, ...prev]);
      setCreating(false);
      alert("Rendez-vous créé ✅");
    } catch {
      alert("Création impossible. Vérifie le patient et la date.");
    }
  };

  // ✏️ Mise à jour
  const onUpdate = async (id: number, data: Omit<Appointment, "id">) => {
    try {
      await updateAppointment(id, data);
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { id, ...data } : x))
      );
      setEditing(null);
      alert("Rendez-vous modifié ✅");
    } catch {
      alert("Mise à jour impossible.");
    }
  };

  // 🗑️ Suppression
  const onDelete = async (id: number) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await deleteAppointment(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert("Rendez-vous supprimé 🗑️");
    } catch {
      alert("Suppression impossible.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Barre de titre */}
      <header className="border-b border-slate-300 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Rendez-vous 📅
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Consultation, suivi, contrôle périodique.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="px-3 py-1 rounded-lg border border-slate-300 bg-white">
              Total :{" "}
              <span className="font-semibold text-slate-800">
                {items.length}
              </span>
            </div>

            {!creating && !editing && (
              <button
                onClick={() => setCreating(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Nouveau
              </button>
            )}

            {(creating || editing) && (
              <button
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Zone d'erreur / chargement */}
        {loading && (
          <div className="text-slate-500 text-sm">Chargement…</div>
        )}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Formulaire création / édition */}
        {(creating || editing) && (
          <section className="bg-white border border-slate-300 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-medium text-slate-800 mb-4">
              {editing
                ? "Modifier le rendez-vous"
                : "Nouveau rendez-vous"}
            </h2>

            <AppointmentForm
              patients={patients}
              initial={editing ?? undefined}
              onSubmit={(vals) =>
                editing
                  ? onUpdate(editing.id, vals)
                  : onCreate(vals)
              }
              onCancel={() => {
                setCreating(false);
                setEditing(null);
              }}
            />
          </section>
        )}

        {/* Tableau des rendez-vous */}
        {!creating && !editing && (
          <section className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300">
                <tr className="text-left">
                  <th className="px-4 py-2">Patient</th>
                  <th className="px-4 py-2">Date / Heure</th>
                  <th className="px-4 py-2">Motif</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b last:border-b-0 border-slate-200"
                  >
                    <td className="px-4 py-3 align-top">
                      {nameById.get(a.patientId) ??
                        `#${a.patientId}`}
                    </td>

                    <td className="px-4 py-3 align-top text-slate-600">
                      {formatDate(a.date)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {a.reason}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setEditing(a)}
                        className="px-2 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Aucun rendez-vous
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
