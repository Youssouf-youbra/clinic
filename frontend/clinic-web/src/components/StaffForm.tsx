import { useEffect, useState } from "react";
import type { Staff } from "../api/clients";

type Props = {
  initial?: Partial<Staff>;
  onSubmit: (data: Omit<Staff, "id">) => Promise<void> | void;
  onCancel: () => void;
};

export default function StaffForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Staff, "id">>({
    nom: "",
    prenom: "",
    role: "",
    email: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        nom: initial.nom ?? "",
        prenom: initial.prenom ?? "",
        role: initial.role ?? "",
        email: initial.email ?? "",
      });
    }
  }, [initial]);

  const change = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 max-w-xl p-4 border rounded-lg bg-white">
      <input
        className="px-3 py-2 border rounded"
        placeholder="Prénom"
        value={form.prenom}
        onChange={(e) => change("prenom", e.target.value)}
        required
      />

      <input
        className="px-3 py-2 border rounded"
        placeholder="Nom"
        value={form.nom}
        onChange={(e) => change("nom", e.target.value)}
        required
      />

      <input
        className="px-3 py-2 border rounded"
        placeholder="Rôle (Médecin, Infirmier, etc.)"
        value={form.role}
        onChange={(e) => change("role", e.target.value)}
        required
      />

      <input
        type="email"
        className="px-3 py-2 border rounded"
        placeholder="Email"
        value={form.email}
        onChange={(e) => change("email", e.target.value)}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
