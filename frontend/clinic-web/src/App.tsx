// src/App.tsx
import { Routes, Route, NavLink } from "react-router-dom";
import Patients from "./pages/Patients";
import AppointmentsPage from "./pages/Appointments";
import StaffPage from "./pages/Staff"; // <-- AJOUT

function Home() { return <h1>Bienvenue 👋</h1>; }

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <h2 style={{ marginRight: "auto" }}>Clinic App</h2>
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/patients">Patients</NavLink>
        <NavLink to="/appointments">Rendez-vous</NavLink>
        <NavLink to="/staff">Personnel</NavLink> {/* <-- AJOUT */}
      </header>

      <hr style={{ margin: "12px 0 24px" }} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/staff" element={<StaffPage />} /> {/* <-- AJOUT */}
      </Routes>
    </div>
  );
}
