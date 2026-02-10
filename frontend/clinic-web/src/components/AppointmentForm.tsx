import { useEffect, useState } from "react";
import type { Appointment, Patient } from "../api/clients";

interface Props {
  patients: Patient[];
  initial?: Appointment;
  onSubmit: (data: Omit<Appointment, "id">) => Promise<void> | void;
  onCancel: () => void;
}

export default function AppointmentForm({
  patients,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const [patientId, setPatientId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Pré-remplissage si on édite
  useEffect(() => {
    if (initial) {
      setPatientId(initial.patientId);
      // convertit la date ISO en format compatible input datetime-local
      const d = new Date(initial.date);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(local);
      setReason(initial.reason ?? "");
    }
  }, [initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !date) {
      alert("Patient et date sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        patientId: Number(patientId),
        date: new Date(date).toISOString(),
        reason,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 max-w-xl">
      {/* Patient */}
      <div>
        <label className="block text-sm mb-1">Patient</label>
        <select
          className="w-full px-3 py-2 border rounded"
          value={patientId}
          onChange={(e) =>
            setPatientId(e.target.value ? Number(e.target.value) : "")
          }
          required
        >
          <option value="">— Sélectionner un patient —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Date / heure */}
      <div>
        <label className="block text-sm mb-1">Date et heure</label>
        <input
          type="datetime-local"
          className="w-full px-3 py-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Motif */}
      <div>
        <label className="block text-sm mb-1">Motif</label>
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Consultation, contrôle, etc."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded border hover:bg-slate-50 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
