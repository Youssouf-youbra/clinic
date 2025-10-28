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

  // charger la liste
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

  // parse erreurs de validation API
  const parseValidation = (err: any) => {
    const data = err?.response?.data;
    if (data?.errors) return Object.values<string[]>(data.errors).flat().join(" | ");
    return data?.title || "Une erreur est survenue.";
  };

  // créer
  const handleCreate = async (data: Omit<Patient, "id">) => {
    try {
      await createPatient(data);
      toast.success("Patient ajouté ✅");
      setCreating(false);
      setPage(1); // revenir page 1
      // refetch
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

  // mettre à jour
  const handleUpdate = async (id: number, data: Omit<Patient, "id">) => {
    try {
      await updatePatient(id, data);
      toast.success("Patient modifié ✅");
      setEditing(null);
      // update optimiste
      setItems((prev) => prev.map((p) => (p.id === id ? { id, ...data } as Patient : p)));
    } catch (e: any) {
      toast.error(parseValidation(e));
    }
  };

  // supprimer
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
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Patients</h2>

      {/* barre d’actions */}
      {!creating && !editing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Rechercher (nom, email, téléphone)"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
            style={{ padding: 8, width: 360 }}
          />
          <button onClick={() => setCreating(true)}>+ Nouveau</button>
        </div>
      )}

      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {/* formulaire création */}
      {creating && (
        <PatientForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {/* formulaire édition */}
      {editing && (
        <PatientForm
          initial={editing}
          onSubmit={(vals) => handleUpdate(editing.id, vals)}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* tableau + actions */}
      {!creating && !editing && (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Prénom</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Nom</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Email</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Téléphone</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{p.firstName}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{p.lastName}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{p.email}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{p.phone}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2", display: "flex", gap: 6 }}>
                    <button onClick={() => setEditing(p)}>Éditer</button>
                    <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, color: "#666" }}>
                    Aucun patient
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* pagination */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀ Précédent
            </button>
            <span>
              page {page} / {totalPages} — {total} résultat(s)
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Suivant ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
