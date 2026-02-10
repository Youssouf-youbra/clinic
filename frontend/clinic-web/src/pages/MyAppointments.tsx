import { useEffect, useState } from "react";
import { api } from "../api/clients";
import { useAuth } from "../context/AuthContext";

interface Appointment {
  id: number;
  date: string;
  reason: string;
  patientId: number;
}

export default function MyAppointments() {
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    api
      .get(`/Appointments/patient/${user.id}`) // ⚠️ ton backend doit exposer cet endpoint
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p style={{ padding: 20 }}>Chargement…</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>📅 Mes Rendez-vous</h1>

      {items.length === 0 ? (
        <p>Aucun rendez-vous</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.date).toLocaleString("fr-CA")}</td>
                <td>{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
