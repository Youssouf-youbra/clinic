import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";  // ⬅️ ajouter ceci

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* ⬅️ entoure App pour rendre l’auth globale */}
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: "15px" },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
