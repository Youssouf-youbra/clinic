import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/patients";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Connexion réussie ✅");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error("Email ou mot de passe invalide.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="login-card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem",
          background: "rgba(255, 255, 255, 0.85)",
          borderRadius: 16,
          boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
          backdropFilter: "blur(4px)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Connexion 🔐</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: "white",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: "white",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 10,
              padding: "12px 16px",
              borderRadius: 50,
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 16,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
