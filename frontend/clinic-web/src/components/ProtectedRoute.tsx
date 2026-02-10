import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: JSX.Element;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = String(user?.role ?? "").toUpperCase();
    const allowed = roles.map((r) => r.toUpperCase());

    if (!allowed.includes(userRole)) {
      return (
        <h2 style={{ margin: 40, color: "crimson" }}>
          🚫 Accès refusé — rôle insuffisant
        </h2>
      );
    }
  }

  return children;
}
