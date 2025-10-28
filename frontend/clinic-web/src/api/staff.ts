import { api } from ".";             // ✅ importe l'index du même dossier
import type { Staff } from "../types";
export async function getStaff(): Promise<Staff[]> {
  const r = await api.get("/Staff");
  return Array.isArray(r.data) ? r.data : [];
}

export async function createStaff(data: Omit<Staff, "id">): Promise<Staff> {
  const r = await api.post("/Staff", data);
  return r.data;
}

export async function updateStaff(id: number, data: Omit<Staff, "id">): Promise<Staff> {
  const r = await api.put(`/Staff/${id}`, data);
  return r.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/Staff/${id}`);
}
