// src/components/RouteGuards.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // on stocke d'où vient l'utilisateur pour le renvoyer après login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

type RequireRoleProps = {
  children: React.ReactNode;
  allowed: string[]; // ex: ["ADMIN", "DOCTOR"]
};

export function RequireRole({ children, allowed }: RequireRoleProps) {
  const { user } = useAuth();
  const location = useLocation();

  const role = (user?.role as string | undefined)?.toUpperCase();

  if (!role || !allowed.map((r) => r.toUpperCase()).includes(role)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location, reason: "role" }}
        replace
      />
    );
  }

  return <>{children}</>;
}
