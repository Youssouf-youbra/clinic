import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5219/api",
  timeout: 10000,
});

// 🔑 Interceptor pour ajouter automatiquement le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log des erreurs API
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

export type Staff = {
  id: number;
  prenom: string;
  nom: string;
  role: string;
  email: string;
};

// 🔹 Types pour les dossiers médicaux
export type MedicalNote = {
  id: number;
  content: string;
  createdAt: string;
};

export type MedicalRecord = {
  id: number;
  patientId: number;
  allergies?: string;
  bloodType?: string;
  chronicDiseases?: string;
  createdAt: string;
  updatedAt: string;
  notes: MedicalNote[];
};

// =====================================================
//                 FONCTIONS PATIENTS
// =====================================================

export async function getPatients(params: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const res = await api.get("/Patients", { params });
  const data = res.data;

  if (Array.isArray(data)) {
    const items = data as Patient[];
    return {
      total: items.length,
      page: 1,
      pageSize: items.length,
      items,
    };
  }

  if (data && Array.isArray(data.items)) {
    const items = data.items as Patient[];
    return {
      total: data.total ?? items.length,
      page: data.page ?? params.page ?? 1,
      pageSize: data.pageSize ?? params.pageSize ?? items.length,
      items,
    };
  }

  return {
    total: 0,
    page: 1,
    pageSize: params.pageSize ?? 10,
    items: [] as Patient[],
  };
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
//              FONCTIONS RENDEZ-VOUS
// =====================================================

export async function getAppointments(): Promise<Appointment[]> {
  const res = await api.get("/Appointments");
  const data = res.data;

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

export async function getMyAppointments(): Promise<Appointment[]> {
  const res = await api.get("/Me/appointments");
  const data = res.data;

  if (Array.isArray(data)) return data as Appointment[];
  if (data?.items && Array.isArray(data.items)) return data.items as Appointment[];
  return [];
}

// =====================================================
//                     FONCTIONS STAFF
// =====================================================

export async function getStaff(): Promise<Staff[]> {
  const res = await api.get("/Staff");
  const data = res.data;

  if (Array.isArray(data)) return data as Staff[];
  if (data?.items && Array.isArray(data.items)) return data.items as Staff[];
  return [];
}

export async function createStaff(body: Omit<Staff, "id">): Promise<Staff> {
  const res = await api.post("/Staff", body);
  return res.data as Staff;
}

export async function updateStaff(
  id: number,
  body: Omit<Staff, "id">
): Promise<Staff> {
  const res = await api.put(`/Staff/${id}`, body);
  return res.data as Staff;
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/Staff/${id}`);
}

// =====================================================
//        FONCTIONS DOSSIERS MÉDICAUX (MedicalRecords)
// =====================================================

// GET /api/MedicalRecords/patient/{patientId}
export async function getMedicalRecordByPatient(
  patientId: number
): Promise<MedicalRecord | null> {
  try {
    const res = await api.get(`/MedicalRecords/patient/${patientId}`);
    return res.data as MedicalRecord;
  } catch (err: any) {
    // si le dossier n'existe pas encore, l'API peut renvoyer 404
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

// POST /api/MedicalRecords  { patientId, ... }
export async function createMedicalRecordForPatient(
  patientId: number
): Promise<MedicalRecord> {
  const body = {
    patientId,
    allergies: "",
    bloodType: "",
    chronicDiseases: "",
  };
  const res = await api.post("/MedicalRecords", body);
  return res.data as MedicalRecord;
}

// POST /api/MedicalRecords/{id}/notes  { content }
export async function addNoteToMedicalRecord(
  recordId: number,
  content: string
): Promise<MedicalNote> {
  const res = await api.post(`/MedicalRecords/${recordId}/notes`, { content });
  return res.data as MedicalNote;
}
