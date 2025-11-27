import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  // Jika user belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika user sudah login, tampilkan halaman tujuan
  return children;
}
