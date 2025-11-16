import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While verifying token, don't redirect immediately
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Verifying session...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // BLOCK SUPER_ADMIN from Main App
  if (user.role === "super_admin") {
    return <Navigate to="/login" replace />;
  }

  // Allowed
  return children;
}
