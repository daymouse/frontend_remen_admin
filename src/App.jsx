import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PetugasPage from "./pages/Petugas";
import Register from "./pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AlertConfirmProvider } from "@/components/providers/AlertConfirmProvider";
import { apiFetch } from "./server";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiFetch("/auth/me", {
          method: "GET",
        });
        setUser(res.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);
  const handleGlobalLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <p className="text-center mt-10">Checking session...</p>;
  }

  return (
    <AlertConfirmProvider>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {user && Number(user.is_admin) === 1 && (
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} onLogout={handleGlobalLogout} />
              </ProtectedRoute>
            }
          />
        )}

        {user && Number(user.is_admin) === 0 && (
          <Route
            path="/petugas/*"
            element={
              <ProtectedRoute user={user}>
                <PetugasPage user={user} onLogout={handleGlobalLogout} />
              </ProtectedRoute>
            }
          />
        )}
        <Route
          path="*"
          element={
            user ? (
              Number(user.is_admin) === 1 ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/petugas" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AlertConfirmProvider>
  );
}

export default App;