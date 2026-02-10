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
import { useAuth } from "../context/AuthContext";

export default function Appointments() {
  const { user } = useAuth();

  // ✅ roles FR + EN
  const role = (user?.role as string | undefined)?.toUpperCase();
  const hasAccess =
    role === "ADMIN" ||
    role === "MEDECIN" ||
    role === "DOCTOR" ||
    role === "PERSONNEL" ||
    role === "STAFF" ||
    role === "INFIRMIER" ||
    role === "SECRETAIRE";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const nameById = useMemo(() => {
    const m = new Map<number, string>();
    patients.forEach((p) => m.set(p.id, `${p.firstName} ${p.lastName}`));
    return m;
  }, [patients]);

  useEffect(() => {
    if (!hasAccess) return;

    setLoading(true);
    setError(null);

    Promise.all([getPatients({ page: 1, pageSize: 200 }), getAppointments()])
      .then(([p, a]) => {
        setPatients(p?.items ?? []);

        // ✅ supporte : liste directe OU {items: [...]}
        const list = Array.isArray(a) ? a : (a?.items ?? []);
        setItems(list);
      })
      .catch(() => setError("Impossible de charger les rendez-vous."))
      .finally(() => setLoading(false));
  }, [hasAccess]);

  const onCreate = async (values: Omit<Appointment, "id">) => {
    const created = await createAppointment(values);
    setItems((prev) => [created, ...prev]);
    setCreating(false);
    alert("Rendez-vous créé ✔");
  };

  const onUpdate = async (id: number, values: Omit<Appointment, "id">) => {
    await updateAppointment(id, values);
    setItems((prev) => prev.map((x) => (x.id === id ? { id, ...values } : x)));
    setEditing(null);
    alert("Rendez-vous modifié ✔");
  };

  const onDelete = async (id: number) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    await deleteAppointment(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    alert("Rendez-vous supprimé ✔");
  };

  if (!hasAccess) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">📅 Rendez-vous</h2>
        <p className="text-red-600">
          🚫 Accès refusé — cette page est réservée au personnel de la clinique.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">📅 Rendez-vous</h2>
      <p className="text-slate-600 text-sm mb-4">
        Connecté en tant que <b>{user?.email}</b> {role ? `(${role})` : ""}
      </p>

      <div className="page-actions">
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md"
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
            className="px-3 py-2 border rounded-md bg-white"
          >
            Annuler
          </button>
        )}
      </div>

      {(creating || editing) && (
        <div className="page-section">
          <AppointmentForm
            patients={patients}
            initial={editing ?? undefined}
            onSubmit={(vals) =>
              editing ? onUpdate(editing.id, vals) : onCreate(vals)
            }
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {!creating && !editing && (
        <>
          {loading && <p>Chargement…</p>}
          {error && <p className="text-red-600">{error}</p>}

          <div className="table-wrap">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Motif</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2">
                      {nameById.get(a.patientId) ?? `#${a.patientId}`}
                    </td>
                    <td className="p-2">
                      {new Date(a.date).toLocaleString("fr-CA")}
                    </td>
                    <td className="p-2">{a.reason}</td>
                    <td className="p-2 text-right space-x-2">
                      <button
                        onClick={() => setEditing(a)}
                        className="px-2 py-1 bg-amber-500 text-white rounded"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        className="px-2 py-1 bg-rose-600 text-white rounded"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-slate-500">
                      Aucun rendez-vous
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
