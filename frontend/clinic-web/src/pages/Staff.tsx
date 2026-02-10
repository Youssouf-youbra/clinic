import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getStaff, createStaff, updateStaff, deleteStaff, type Staff } from "../api/clients";

export default function StaffPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  // form
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);

    getStaff()
      .then((d) => {
        const list = d ?? [];
        const q = query.trim().toLowerCase();

        const filtered = !q
          ? list
          : list.filter((s: Staff) =>
              `${s.nom} ${s.prenom} ${s.role} ${s.email}`.toLowerCase().includes(q)
            );

        setItems(filtered);
      })
      .catch(() => setError("Impossible de charger le personnel."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setRole("");
    setEmail("");
  };

  const startCreate = () => {
    resetForm();
    setEditing(null);
    setCreating(true);
  };

  const startEdit = (s: Staff) => {
    setCreating(false);
    setEditing(s);
    setNom(s.nom);
    setPrenom(s.prenom);
    setRole(s.role);
    setEmail(s.email);
  };

  const handleSave = async () => {
    if (!nom || !prenom || !role || !email) {
      toast.error("Tous les champs sont requis.");
      return;
    }

    try {
      if (editing) {
        await updateStaff(editing.id, { id: editing.id, nom, prenom, role, email } as any);
        toast.success("Personnel modifié ✅");
        setEditing(null);
      } else {
        await createStaff({ nom, prenom, role, email } as any);
        toast.success("Personnel ajouté ✅");
        setCreating(false);
      }
      load();
    } catch {
      toast.error("Enregistrement impossible.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce membre du personnel ?")) return;
    try {
      await deleteStaff(id);
      toast.success("Supprimé ✅");
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Suppression impossible.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personnel</h2>

      {!creating && !editing && (
        <div className="page-actions">
          <input
            className="px-3 py-2 border rounded w-80"
            placeholder="Rechercher (nom, rôle, email)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={startCreate}>
            + Nouveau membre
          </button>
        </div>
      )}

      {(creating || editing) && (
        <div className="page-section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {editing ? "Modifier un membre" : "Nouveau membre"}
            </h3>
            <button
              className="px-3 py-1.5 border rounded bg-white"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Fermer
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <input className="px-3 py-2 border rounded w-56" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            <input className="px-3 py-2 border rounded w-56" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            <input className="px-3 py-2 border rounded w-56" placeholder="Rôle (Doctor/Staff…)" value={role} onChange={(e) => setRole(e.target.value)} />
            <input className="px-3 py-2 border rounded w-80" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={handleSave}>
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.prenom}</td>
                <td>{s.nom}</td>
                <td>{s.role}</td>
                <td>{s.email}</td>
                <td className="flex gap-2">
                  <button className="px-2 py-1 bg-amber-500 text-white rounded" onClick={() => startEdit(s)}>
                    Éditer
                  </button>
                  <button className="px-2 py-1 bg-rose-600 text-white rounded" onClick={() => handleDelete(s.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Aucun membre
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
