import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PetugasPage from "./pages/Petugas";
import ProtectedRoute from "./ProtectedRoute";
import { apiFetch } from "./server";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek user login lewat endpoint /me
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

  // Fungsi untuk logout yang bisa di-pass ke komponen lain
  const handleGlobalLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <p className="text-center mt-10">Checking session...</p>;
  }

  return (
    <Routes>
      {/* LOGIN PAGE - KIRIM setUser SEBAGAI PROP */}
      <Route
        path="/login"
        element={<Login setUser={setUser} />}
        
      />

      {/* ================== ADMIN DASHBOARD ================== */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute user={user}>
            {user?.is_admin ? (
              <Dashboard user={user} onLogout={handleGlobalLogout} />
            ) : (
              <Navigate to="/petugas" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* ================== PETUGAS PAGE ================== */}
      <Route
        path="/petugas/*"
        element={
          <ProtectedRoute user={user}>
            {!user?.is_admin ? (
              <PetugasPage user={user} onLogout={handleGlobalLogout} />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* Default fallback jika route tidak ada */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;