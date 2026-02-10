import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  type Patient,
} from "../api/clients";
import PatientForm from "../components/PatientForm";
import { useAuth } from "../context/AuthContext";

export default function PatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = String(user?.role ?? "").toUpperCase(); // ADMIN / DOCTOR / STAFF / PATIENT

  const canCreate = ["ADMIN", "DOCTOR", "STAFF"].includes(role);
  const canEdit = ["ADMIN", "DOCTOR", "STAFF"].includes(role);
  const canDelete = role === "ADMIN";
  const canOpenRecord = ["ADMIN", "DOCTOR"].includes(role);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Patient[]>([]);

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
          setTotal(d?.total ?? 0);
          setItems(Array.isArray(d?.items) ? d.items : []);
        })
        .catch(() => setError("Impossible de charger les patients."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(t);
  }, [query, page]);

  const handleExportCsv = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Vous n’êtes pas connecté.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5219/api/Exports/patients.csv", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "patients.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("CSV exporté avec succès 📄");
    } catch {
      toast.error("Échec de l’export CSV.");
    }
  };

  const handleOpenMedicalRecords = (patientId: number) => {
    if (!canOpenRecord) {
      toast.error("Accès refusé (réservé Admin / Doctor).");
      return;
    }
    navigate(`/medical-records?patientId=${patientId}`);
  };

  const handleCreate = async (data: Omit<Patient, "id">) => {
    try {
      await createPatient(data);
      toast.success("Patient ajouté ✅");
      setCreating(false);
      setPage(1);
    } catch {
      toast.error("Erreur lors de l’ajout.");
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
    } catch {
      toast.error("Erreur lors de la modification.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      toast.error("Suppression réservée à l’Admin.");
      return;
    }
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
    <div className="page-wrapper">
      <h2 className="text-xl font-semibold mb-4">Patients</h2>

      {!creating && !editing && (
        <div className="flex gap-3 mb-4 items-center">
          <input
            className="px-3 py-2 border rounded w-80"
            placeholder="Rechercher (nom, email, téléphone)"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />

          {canCreate && (
            <button
              className="px-3 py-2 rounded bg-blue-600 text-white"
              onClick={() => setCreating(true)}
            >
              + Nouveau
            </button>
          )}

          <button
            className="px-3 py-2 rounded bg-emerald-600 text-white"
            onClick={handleExportCsv}
          >
            Exporter CSV
          </button>
        </div>
      )}

      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {creating && (
        <PatientForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {editing && (
        <PatientForm
          initial={editing}
          onSubmit={(vals) => handleUpdate(editing.id, vals)}
          onCancel={() => setEditing(null)}
        />
      )}

      {!creating && !editing && (
        <>
          <table>
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.firstName}</td>
                  <td>{p.lastName}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>

                  <td className="flex gap-2">
                    {canOpenRecord && (
                      <button
                        className="px-2 py-1 bg-indigo-600 text-white rounded"
                        onClick={() => handleOpenMedicalRecords(p.id)}
                      >
                        Dossier médical
                      </button>
                    )}

                    {canEdit && (
                      <button
                        className="px-2 py-1 bg-amber-500 text-white rounded"
                        onClick={() => setEditing(p)}
                      >
                        Éditer
                      </button>
                    )}

                    {canDelete && (
                      <button
                        className="px-2 py-1 bg-rose-600 text-white rounded"
                        onClick={() => handleDelete(p.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Aucun patient
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex gap-3 mt-4 items-center">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀ Précédent
            </button>
            <span>
              page {page} / {totalPages} — {total} résultat(s)
            </span>
            <button
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
