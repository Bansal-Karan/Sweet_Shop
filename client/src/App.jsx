import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import AdminLogin from "./page/AdminLogin";
import AdminDashboard from "./page/AdminDashboard";
import Cart from "./page/Cart";
import Sweets from "./page/Sweets";

import ProtectedRoute from "./components/ProtectRoutes";
import PublicRoute from "./components/PublicRoute";
import { api } from "./utils/axios";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public (blocked when logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute user={user}>
              <Login fetchUser={fetchUser} />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute user={user}>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/admin/login"
          element={
            <PublicRoute user={user}>
              <AdminLogin fetchUser={fetchUser} />
            </PublicRoute>
          }
        />

        {/* Public home */}
        <Route path="/" element={<Home />} />

        {/* Admin protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Customer protected */}
        <Route
          path="/sweets"
          element={
            <ProtectedRoute user={user} allowedRoles={["Customer"]}>
              <Sweets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute user={user} allowedRoles={["Customer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer />
    </Router>
  );
};

export default App;
