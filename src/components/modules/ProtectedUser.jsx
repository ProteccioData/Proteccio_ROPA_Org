import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedUserSetup({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "org_admin" && user.role !== "super_admin")
    return <Navigate to="/unauthorized" />;

  return children;
}
