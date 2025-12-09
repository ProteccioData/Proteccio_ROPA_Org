import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PermissionProtectedRoute({ children, permissionKey }) {
  const { permissions, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Verifying permissions...
      </div>
    );
  }

  if (!permissions) {
    return <Navigate to="/" replace />;
  }

  const hasPermission = () => {
    if (!permissionKey) return true;

    // Old boolean format check:
    if (permissions[permissionKey] === true) return true;

    // New module-based format: "view_ropa"
    if (permissionKey.includes("_")) {
      const [action, module] = permissionKey.split("_");

      const modulePerms = permissions[module]; // e.g. permissions["ropa"]

      if (Array.isArray(modulePerms)) {
        return modulePerms.includes(action);
      }
    }

    return false;
  };

  if (!hasPermission()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
