import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5219/api",
  timeout: 10000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("API error:", err);
    return Promise.reject(err);
  }
);

// =====================================================
//                    TYPES
// =====================================================
export type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type Appointment = {
  id: number;
  patientId: number;
  date: string; // ISO format: "2025-10-08T10:30:00Z"
  reason?: string;
};

// =====================================================
//                 FONCTIONS PATIENTS
// =====================================================

export async function getPatients(params: { query?: string; page?: number; pageSize?: number }) {
  const res = await api.get("/Patients", { params });
  return res.data as { total: number; page: number; pageSize: number; items: Patient[] };
}

export async function createPatient(body: Omit<Patient, "id">) {
  const res = await api.post("/Patients", body);
  return res.data as Patient;
}

export async function updatePatient(id: number, body: Omit<Patient, "id">) {
  const res = await api.put(`/Patients/${id}`, body);
  return res.data as Patient;
}

export async function deletePatient(id: number) {
  await api.delete(`/Patients/${id}`);
}

// =====================================================
//              FONCTIONS RENDEZ-VOUS (APPOINTMENTS)
// =====================================================

export async function getAppointments(): Promise<Appointment[]> {
  const res = await api.get("/Appointments");
  const data = res.data;

  // ✅ Normalisation : on renvoie toujours un tableau
  if (Array.isArray(data)) return data as Appointment[];
  if (data?.items && Array.isArray(data.items)) return data.items as Appointment[];
  return [];
}

export async function createAppointment(body: Omit<Appointment, "id">) {
  const res = await api.post("/Appointments", body);
  return res.data as Appointment;
}

export async function updateAppointment(id: number, body: Omit<Appointment, "id">) {
  const res = await api.put(`/Appointments/${id}`, body);
  return res.data as Appointment;
}

export async function deleteAppointment(id: number) {
  await api.delete(`/Appointments/${id}`);
}
