import { Navigate } from "react-router-dom";

const PublicRoute = ({ user, children }) => {
  // If logged in, redirect based on role
  if (user) {
    if (user.role === "Admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/sweets" replace />;
  }

  // Not logged in → allow access
  return children;
};

export default PublicRoute;
