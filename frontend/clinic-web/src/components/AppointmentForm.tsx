import { useEffect, useState } from "react";
import type { Appointment, Patient } from "../api/clients";

type Props = {
  patients: Patient[];                          // liste pour le <select>
  initial?: Partial<Appointment>;               // si on édite un rendez-vous
  onSubmit: (data: Omit<Appointment, "id">) => void;
  onCancel: () => void;
};

export default function AppointmentForm({ patients, initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Appointment, "id">>({
    patientId: 0,
    date: "",
    reason: "",
  });

  // Pré-remplissage si édition
  useEffect(() => {
    if (!initial) return;
    setForm({
      patientId: initial.patientId ?? 0,
      // l'input datetime-local ne supporte pas le "Z" => on le retire pour l'affichage
      date: initial.date ? initial.date.replace("Z", "") : "",
      reason: initial.reason ?? "",
    });
  }, [initial]);

  const change = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Si la valeur vient d'un <input type="datetime-local">, elle n'a pas de fuseau => ajouter "Z" (UTC)
    const iso = form.date && !form.date.endsWith("Z") ? `${form.date}Z` : form.date;
    onSubmit({ ...form, date: iso });
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
      <label style={{ display: "grid", gap: 6 }}>
        Patient
        <select
          value={form.patientId}
          onChange={(e) => change("patientId", Number(e.target.value))}
          required
          style={{ padding: 8 }}
        >
          <option value={0} disabled>— choisir —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} (#{p.id})
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        Date & heure
        <input
          type="datetime-local"
          value={form.date}
          onChange={(e) => change("date", e.target.value)}
          required
          style={{ padding: 8 }}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        Motif (raison)
        <input
          value={form.reason ?? ""}
          onChange={(e) => change("reason", e.target.value)}
          placeholder="ex: consultation, contrôle…"
          style={{ padding: 8 }}
        />
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Enregistrer</button>
        <button type="button" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}
