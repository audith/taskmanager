import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly }) {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  if (!token) return <Navigate to="/" />;

  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return children;
}