import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // role not allowed
  if (!allowedRoles.includes(user.role)) {
    // redirect based on role
    if (user.role === "Admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/sweets" replace />;
  }

  return children;
};

export default ProtectedRoute;
