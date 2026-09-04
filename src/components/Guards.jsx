import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

export function RequireProfile({ children }) {
  const { user, loading, profileCompleted } = useAuth();
  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (!profileCompleted) {
    return <Navigate to={user.role === "mentor" ? "/profile/mentor" : "/profile/student"} replace />;
  }
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 60, textAlign: "center" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/groups" replace />;
  return children;
}
