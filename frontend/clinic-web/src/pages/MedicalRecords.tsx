import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { api, getStaff, type Staff } from "../api/clients";
import { useAuth } from "../context/AuthContext";

type MedicalNote = {
  id: number;
  staffId?: number | null;
  staffName?: string | null;
  content: string;
  createdAt: string;
};

type MedicalRecord = {
  id: number;
  patientId: number;
  allergies?: string | null;
  bloodType?: string | null;
  chronicDiseases?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  notes: MedicalNote[];
};

export default function MedicalRecords() {
  const { user } = useAuth();
  const location = useLocation();

  const role = String(user?.role ?? "").toUpperCase();
  const hasAccess = role === "ADMIN" || role === "DOCTOR" || role === "MEDECIN";


  const searchParams = new URLSearchParams(location.search);
  const patientIdParam = searchParams.get("patientId");

  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    if (!hasAccess) return;
    if (!user?.email) return;

    (async () => {
      try {
        const allStaff: Staff[] = await getStaff();
        const me = allStaff.find(
          (s) =>
            (s.email ?? "").toLowerCase() === String(user.email).toLowerCase()
        );
        if (me) setStaffId(me.id);
      } catch {
        // si /Staff renvoie 403, on continue quand même
      }
    })();
  }, [hasAccess, user?.email]);

  useEffect(() => {
    if (!patientIdParam || !hasAccess) return;

    setLoading(true);
    setError(null);

    api
      .get<MedicalRecord>(`/MedicalRecords/patient/${patientIdParam}`)
      .then((res) => setRecord(res.data))
      .catch((err) => {
        if (err?.response?.status === 404) setRecord(null);
        else {
          setError("Impossible de charger le dossier médical.");
        }
      })
      .finally(() => setLoading(false));
  }, [patientIdParam, hasAccess]);

  const ensureRecord = async (): Promise<MedicalRecord> => {
    if (record) return record;
    if (!patientIdParam) throw new Error("Aucun patient sélectionné.");

    const res = await api.post<MedicalRecord>("/MedicalRecords", {
      patientId: Number(patientIdParam),
      allergies: "",
      bloodType: "",
      chronicDiseases: "",
    });

    setRecord(res.data);
    return res.data;
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setSaving(true);

      if (!hasAccess) {
        toast.error("Accès refusé.");
        return;
      }

      const rec = await ensureRecord();

      if (editingNoteId != null) {
        const res = await api.put<MedicalNote>(
          `/MedicalRecords/notes/${editingNoteId}`,
          { content: noteText.trim() }
        );

        const updated = res.data;

        setRecord((prev) =>
          prev
            ? {
                ...prev,
                notes: prev.notes.map((n) => (n.id === updated.id ? updated : n)),
              }
            : prev
        );

        toast.success("Note modifiée ✅");
        setEditingNoteId(null);
        setNoteText("");
        return;
      }

      const res = await api.post<MedicalNote>(`/MedicalRecords/${rec.id}/notes`, {
        staffId,
        content: noteText.trim(),
      });

      const created = res.data;

      setRecord((prev) =>
        prev ? { ...prev, notes: [created, ...prev.notes] } : { ...rec, notes: [created] }
      );

      toast.success("Note ajoutée ✅");
      setNoteText("");
    } catch {
      toast.error("Erreur lors de l'enregistrement de la note.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: MedicalNote) => {
    setEditingNoteId(note.id);
    setNoteText(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm("Supprimer cette note ?")) return;
    try {
      await api.delete(`/MedicalRecords/notes/${noteId}`);
      setRecord((prev) =>
        prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : prev
      );
      toast.success("Note supprimée 🗑️");
    } catch {
      toast.error("Impossible de supprimer la note.");
    }
  };

  if (!hasAccess) {
    return (
      <div className="page-wrapper">
        <h2>📁 Dossiers Médicaux</h2>
        <p style={{ marginTop: 8, color: "crimson" }}>
          🚫 Accès refusé — réservé Admin / Doctor.
        </p>
      </div>
    );
  }

  if (!patientIdParam) {
    return (
      <div className="page-wrapper">
        <h2>📁 Dossiers Médicaux</h2>
        <p style={{ marginTop: 8 }}>
          Aucun patient sélectionné. Retourne sur <strong>Patients</strong> et clique sur{" "}
          <strong>Dossier médical</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <h2 style={{ marginBottom: 12 }}>📁 Dossiers Médicaux</h2>
      <p style={{ marginBottom: 16 }}>
        Dossier pour le patient ID : <strong>{patientIdParam}</strong>
      </p>

      {loading && <p>Chargement du dossier...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section className="page-section">
        <form onSubmit={handleSaveNote}>
          <h3 style={{ marginBottom: 8 }}>
            {editingNoteId ? "Modifier la note" : "Nouvelle note médicale"}
          </h3>

          <textarea
            placeholder="Observation, diagnostic, traitement..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8, resize: "vertical" }}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving}>
              {saving
                ? "Enregistrement..."
                : editingNoteId
                ? "Enregistrer les modifications"
                : "Ajouter la note"}
            </button>

            {editingNoteId && (
              <button type="button" onClick={handleCancelEdit}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="page-section">
        <h3>Notes</h3>

        {(!record || record.notes.length === 0) && (
          <p style={{ marginTop: 8, color: "#666" }}>
            Aucune note enregistrée pour ce patient.
          </p>
        )}

        {record && record.notes.length > 0 && (
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Date</th>
                <th style={{ textAlign: "left" }}>Médecin</th>
                <th style={{ textAlign: "left" }}>Contenu</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {record.notes.map((n) => (
                <tr key={n.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                  <td>{n.staffName ?? "-"}</td>
                  <td>{n.content}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button type="button" onClick={() => handleEdit(n)} style={{ marginRight: 4 }}>
                      Modifier
                    </button>
                    <button type="button" onClick={() => handleDelete(n.id)} style={{ color: "crimson" }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
