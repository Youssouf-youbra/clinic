import { useEffect, useMemo, useState } from "react";
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
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

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
    }, 250);

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
      setItems((prev) =>
        prev.map((p) => (p.id === id ? ({ id, ...data } as Patient) : p))
      );
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

  // ✅ EXPORT CSV
  const handleExportCsv = async () => {
    if (exporting) return;

    try {
      setExporting(true);

      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

      if (!token) {
        toast.error("Pas connecté.");
        return;
      }

      const res = await fetch("http://localhost:5219/api/Exports/patients.csv", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error("Export impossible (autorisation/serveur).");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `patients_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
      toast.success("Export CSV téléchargé ✅");
    } catch {
      toast.error("Erreur lors de l’export.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold">Patients</h2>
          <p className="text-sm text-gray-600">
            {loading ? "Chargement..." : `${total} résultat(s)`}
          </p>
        </div>

        {!creating && !editing && (
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
              onClick={() => setCreating(true)}
            >
              ➕ Nouveau
            </button>

            <button
              className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.99]"
              onClick={handleExportCsv}
              disabled={exporting}
              title="Exporter la liste des patients en CSV"
            >
              {exporting ? "⏳ Export..." : "⬇️ Exporter CSV"}
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {!creating && !editing && (
        <div className="mb-3">
          <input
            className="w-full md:w-[420px] px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Rechercher (nom, email, téléphone)"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
        </div>
      )}

      {/* States */}
      {error && <div className="text-rose-600 mb-2">{error}</div>}
      {loading && <div className="text-gray-600 mb-2">Chargement…</div>}

      {/* Forms */}
      {creating && (
        <div className="mb-4 border rounded p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Ajouter un patient</h3>
            <button className="text-gray-600 hover:underline" onClick={() => setCreating(false)}>
              Fermer
            </button>
          </div>
          <PatientForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-4 border rounded p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Modifier le patient</h3>
            <button className="text-gray-600 hover:underline" onClick={() => setEditing(null)}>
              Fermer
            </button>
          </div>
          <PatientForm
            initial={editing}
            onSubmit={(vals) => handleUpdate(editing.id, vals)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* Table */}
      {!creating && !editing && (
        <>
          <div className="overflow-auto border rounded">
            <table className="w-full border-collapse min-w-[720px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left border-b p-2">Prénom</th>
                  <th className="text-left border-b p-2">Nom</th>
                  <th className="text-left border-b p-2">Email</th>
                  <th className="text-left border-b p-2">Téléphone</th>
                  <th className="text-left border-b p-2 w-[220px]">Actions</th>
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
                          ✏️ Éditer
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                          onClick={() => handleDelete(p.id)}
                        >
                          🗑️ Supprimer
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
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-3">
            <button
              className="px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ◀ Précédent
            </button>

            <span className="text-sm text-gray-700">
              page <b>{page}</b> / <b>{totalPages}</b> — {total} résultat(s)
            </span>

            <button
              className="px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
              disabled={page >= totalPages}
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
