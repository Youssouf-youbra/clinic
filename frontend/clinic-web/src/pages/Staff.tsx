import { useEffect, useMemo, useState } from "react";
import type { Staff } from "../types";
import { getStaff, createStaff, updateStaff, deleteStaff } from "../api/staff";

const roles = ["Medecin", "Infirmier", "Secretaire"];

export default function StaffPage() {
  const [items, setItems] = useState<Staff[]>([]);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState<Omit<Staff, "id">>({
    nom: "", prenom: "", role: "Medecin", email: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await getStaff()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x => (`${x.nom} ${x.prenom} ${x.role} ${x.email}`).toLowerCase().includes(s));
  }, [items, search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form };
    const saved = editing ? await updateStaff(editing.id, payload) : await createStaff(payload);
    setItems(prev => editing ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]);
    setEditing(null);
    setForm({ nom: "", prenom: "", role: "Medecin", email: "" });
  }

  async function onDelete(id: number) {
    if (!confirm("Supprimer ce membre ?")) return;
    await deleteStaff(id);
    setItems(prev => prev.filter(x => x.id !== id));
  }

  function startEdit(s: Staff) {
    setEditing(s);
    setForm({ nom: s.nom, prenom: s.prenom, role: s.role, email: s.email });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      {/* --- En-tête --- */}
      <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-semibold flex items-center gap-3">
            👥 Gestion du Personnel
          </h1>
          <p className="text-white/90 mt-1">
            Gérer les médecins, infirmiers et le personnel administratif.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg">
            <span className="text-sm">Total</span>
            <span className="font-semibold">{items.length}</span>
          </div>
        </div>
      </div>

      {/* --- Contenu principal --- */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Barre de recherche */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <input
              className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 pl-11 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Rechercher un nom, rôle ou email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-neutral-700 px-4 py-2.5 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            {loading ? "…" : "Rafraîchir"}
          </button>
        </div>

        {/* Grille : Formulaire + Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- Formulaire --- */}
          <form onSubmit={onSubmit} className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
              {editing ? "Modifier un membre" : "Ajouter un membre"}
            </h2>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2.5 bg-white dark:bg-neutral-900"
                  placeholder="Entrez le nom…"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2.5 bg-white dark:bg-neutral-900"
                  placeholder="Entrez le prénom…"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2.5 bg-white dark:bg-neutral-900"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2.5 bg-white dark:bg-neutral-900"
                  placeholder="ex. nom@domaine.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg">
                {editing ? "Mettre à jour" : "Ajouter"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setForm({ nom: "", prenom: "", role: "Medecin", email: "" }); }}
                  className="border border-gray-300 dark:border-neutral-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>

          {/* --- Tableau --- */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
              Liste du personnel
            </h2>

            {err ? (
              <div className="text-red-600 text-sm">{err}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-neutral-800">
                  <thead className="bg-slate-50 dark:bg-neutral-800">
                    <tr className="text-left">
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Prénom</th>
                      <th className="px-3 py-2">Rôle</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2">{s.nom}</td>
                        <td className="px-3 py-2">{s.prenom}</td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 text-xs">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-3 py-2">{s.email}</td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button
                            onClick={() => startEdit(s)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => onDelete(s.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                          Aucun résultat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
