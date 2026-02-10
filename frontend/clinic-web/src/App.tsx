import { Routes, Route, NavLink } from "react-router-dom";
import Patients from "./pages/Patients";
import AppointmentsPage from "./pages/Appointments";
import StaffPage from "./pages/Staff";
import MedicalRecords from "./pages/MedicalRecords";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import MyAppointments from "./pages/MyAppointments";

function Home() {
  return <h1>Bienvenue 👋</h1>;
}

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  const role = String(user?.role ?? "").toUpperCase(); // ADMIN / MEDECIN / PERSONNEL / PATIENT

  const isStaffUser = ["ADMIN", "MEDECIN", "PERSONNEL"].includes(role);
  const canSeeMedicalRecords = ["ADMIN", "MEDECIN"].includes(role);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <h2 style={{ marginRight: "auto" }}>Clinic App</h2>

        {isAuthenticated && (
          <>
            <NavLink to="/" end>
              Accueil
            </NavLink>

            {/* Admin / Medecin / Personnel */}
            {isStaffUser && (
              <>
                <NavLink to="/patients">Patients</NavLink>
                <NavLink to="/appointments">Rendez-vous</NavLink>

                {/* Admin / Medecin seulement */}
                {canSeeMedicalRecords && (
                  <>
                    <NavLink to="/staff">Personnel</NavLink>
                    <NavLink to="/medical-records">Dossiers Médicaux</NavLink>
                  </>
                )}
              </>
            )}

            {/* Patient */}
            {role === "PATIENT" && (
              <NavLink to="/my-appointments">Mes rendez-vous</NavLink>
            )}
          </>
        )}

        <div style={{ marginLeft: "auto" }}>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: 10 }}>
                {user?.email} {role && `(${role})`}
              </span>
              <button onClick={logout}>Déconnexion</button>
            </>
          ) : (
            <NavLink to="/login">Connexion</NavLink>
          )}
        </div>
      </header>

      <hr style={{ margin: "12px 0 24px" }} />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Patients : Admin/Medecin/Personnel */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={["Admin", "Medecin", "Personnel"]}>
              <Patients />
            </ProtectedRoute>
          }
        />

        {/* Appointments : Admin/Medecin/Personnel */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute roles={["Admin", "Medecin", "Personnel"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Staff : Admin/Medecin */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["Admin", "Medecin"]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />

        {/* Medical Records : Admin/Medecin */}
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute roles={["Admin", "Medecin"]}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />

        {/* Patient only */}
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute roles={["Patient"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
