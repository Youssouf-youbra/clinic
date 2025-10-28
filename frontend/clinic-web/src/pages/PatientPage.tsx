import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  type Patient,
} from "../api/clients";
import PatientForm from "../components/PatientForm";

export default function PatientsPage() {
  // recherche + pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // données
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Patient[]>([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      getPatients({ query, page, pageSize })
        .then((d) => {
          setTotal(d?.total ?? (Array.isArray(d?.items) ? d.items.length : 0));
          setItems(Array.isArray(d?.items) ? d.items : []);
        })
        .catch(() => setError("Impossible de charger les patients."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, page, pageSize]);

  const parseValidation = (err: any) => {
    const data = err?.response?.data;
    if (data?.errors) return Object.values<string[]>(data.errors).flat().join(" | ");
    return data?.title || "Une erreur est survenue.";
  };

  const handleCreate = async (data: Omit<Patient, "id">) => {
    try {
      await createPatient(data);
      toast.success("Patient ajouté ✅");
      setCreating(false);
      setPage(1);
      setLoading(true);
      const d = await getPatients({ query, page: 1, pageSize });
      setTotal(d?.total ?? 0);
      setItems(d?.items ?? []);
    } catch (e: any) {
      toast.error(parseValidation(e));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, data: Omit<Patient, "id">) => {
    try {
      await updatePatient(id, data);
      toast.success("Patient modifié ✅");
      setEditing(null);
      setItems((prev) => prev.map((p) => (p.id === id ? ({ id, ...data } as Patient) : p)));
    } catch (e: any) {
      toast.error(parseValidation(e));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce patient ?")) return;
    try {
      await deletePatient(id);
      toast.success("Patient supprimé 🗑️");
      setItems((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      toast.error("Suppression impossible.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Patients</h2>

      {/* Actions bar */}
      {!creating && !editing && (
        <div className="flex gap-2 mb-3">
          <input
            className="w-96 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Rechercher (nom, email, téléphone)"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setCreating(true)}
          >
            + Nouveau
          </button>
        </div>
      )}

      {loading && <div className="text-gray-600">Chargement…</div>}
      {error && <div className="text-rose-600">{error}</div>}

      {/* Formulaire création */}
      {creating && (
        <div className="mb-4">
          <PatientForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {/* Formulaire édition */}
      {editing && (
        <div className="mb-4">
          <PatientForm
            initial={editing}
            onSubmit={(vals) => handleUpdate(editing.id, vals)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {!creating && !editing && (
        <>
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left border-b p-2">Prénom</th>
                <th className="text-left border-b p-2">Nom</th>
                <th className="text-left border-b p-2">Email</th>
                <th className="text-left border-b p-2">Téléphone</th>
                <th className="text-left border-b p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border-b p-2">{p.firstName}</td>
                  <td className="border-b p-2">{p.lastName}</td>
                  <td className="border-b p-2">{p.email}</td>
                  <td className="border-b p-2">{p.phone}</td>
                  <td className="border-b p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
                        onClick={() => setEditing(p)}
                      >
                        Éditer
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                        onClick={() => handleDelete(p.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-3 text-gray-600 text-center">
                    Aucun patient
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center gap-2 mt-3">
            <button
              className="px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ◀ Précédent
            </button>
            <span>
              page {page} / {Math.max(1, Math.ceil(total / pageSize))} — {total} résultat(s)
            </span>
            <button
              className="px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
              disabled={page * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
