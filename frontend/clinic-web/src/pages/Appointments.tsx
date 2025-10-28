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

  // 📦 Charger les données patients + rendez-vous
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getPatients({ page: 1, pageSize: 200 }), getAppointments()])
      .then(([p, a]) => {
        setPatients(p.items ?? []);
        setItems(a); // ✅ a est déjà un tableau
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
      setItems((prev) => prev.map((x) => (x.id === id ? { id, ...data } : x)));
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
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Rendez-vous</h2>

      {!creating && !editing && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setCreating(true)}>+ Nouveau</button>
        </div>
      )}

      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {creating && (
        <AppointmentForm
          patients={patients}
          onSubmit={onCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <AppointmentForm
          patients={patients}
          initial={editing}
          onSubmit={(vals) => onUpdate(editing.id, vals)}
          onCancel={() => setEditing(null)}
        />
      )}

      {!creating && !editing && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Patient</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Date/Heure (UTC)</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Motif</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((a) => (
              <tr key={a.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                  {nameById.get(a.patientId) ?? `#${a.patientId}`}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{a.date}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{a.reason}</td>
                <td
                  style={{
                    padding: 8,
                    borderBottom: "1px solid #f2f2f2",
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <button onClick={() => setEditing(a)}>Éditer</button>
                  <button onClick={() => onDelete(a.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ padding: 12, color: "#666" }}>
                  Aucun rendez-vous
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
