import { useState, useEffect } from "react";
import type { Patient } from "../api/clients";

type Props = {
  initial?: Partial<Patient>;
  onSubmit: (data: Omit<Patient, "id">) => Promise<void> | void;
  onCancel: () => void;
};

export default function PatientForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Patient, "id">>({
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        firstName: initial.firstName ?? "",
        lastName: initial.lastName ?? "",
        birthDate: initial.birthDate ?? "",
        phone: initial.phone ?? "",
        email: initial.email ?? "",
        address: initial.address ?? "",
      });
    }
  }, [initial]);

  const change = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Le prénom est obligatoire.";
    if (!form.lastName.trim()) e.lastName = "Le nom est obligatoire.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email invalide.";
    if (form.phone && form.phone.length > 25) e.phone = "Téléphone trop long (25 max).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toDto = (f: Omit<Patient, "id">): Omit<Patient, "id"> => ({
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    birthDate: f.birthDate || "",
    phone: f.phone?.trim() || "",
    email: f.email?.trim() || "",
    address: f.address?.trim() || "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(toDto(form));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 max-w-xl p-4 border rounded-lg bg-white"
    >
      <div>
        <input
          className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Prénom"
          value={form.firstName}
          onChange={(e) => change("firstName", e.target.value)}
          required
        />
        {errors.firstName && <small className="text-rose-600">{errors.firstName}</small>}
      </div>

      <div>
        <input
          className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nom"
          value={form.lastName}
          onChange={(e) => change("lastName", e.target.value)}
          required
        />
        {errors.lastName && <small className="text-rose-600">{errors.lastName}</small>}
      </div>

      <input
        type="date"
        className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
        value={form.birthDate ?? ""}
        onChange={(e) => change("birthDate", e.target.value)}
      />

      <div>
        <input
          className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Téléphone"
          value={form.phone ?? ""}
          onChange={(e) => change("phone", e.target.value)}
        />
        {errors.phone && <small className="text-rose-600">{errors.phone}</small>}
      </div>

      <div>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          value={form.email ?? ""}
          onChange={(e) => change("email", e.target.value)}
        />
        {errors.email && <small className="text-rose-600">{errors.email}</small>}
      </div>

      <input
        className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Adresse"
        value={form.address ?? ""}
        onChange={(e) => change("address", e.target.value)}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
