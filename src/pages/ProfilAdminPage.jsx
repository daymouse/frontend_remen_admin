import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Edit } from "lucide-react";
import { apiFetch } from "../server.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilAdminPage({ onLogout }) { 
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    passwordLama: "",
    password: "",
    konfirmasiPassword: "",
  });
  const [error, setError] = useState("");

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin");
      setAdmin(data);
      setForm({ ...form, username: data.username });
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleLogout = async () => {
    if (!confirm("Apakah yakin ingin logout?")) {
      window.addEventListener("confirm-ok", handleLogout, { once: true })
      return
    }
    
    try {
      // Panggil API logout
      await apiFetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Error during logout:", err.message);
    } finally {
      // SELALU jalankan cleanup meski API success atau error
      
      // Hapus semua token dari localStorage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userToken");
      
      // Hapus semua token dari cookies dengan berbagai path dan domain
      const cookiePaths = ["/", "/admin", "/api"];
      const cookieNames = ["adminToken", "token", "userToken", "sessionToken"];
      
      cookieNames.forEach(cookieName => {
        cookiePaths.forEach(path => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${window.location.hostname};`;
        });
        // Juga hapus tanpa path specification
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      });

      // Hapus sessionStorage juga untuk keamanan lengkap
      sessionStorage.clear();
      
      // Panggil onLogout dari parent untuk reset user state di App.js
      if (onLogout) {
        onLogout();
      }
      
      // Bersihkan state lokal
      setAdmin(null);
      setLoading(true);
      
      // Navigasi ke halaman login tanpa refresh
      navigate("/login", { replace: true });
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.passwordLama) {
      setError("Masukkan password lama untuk konfirmasi.");
      return;
    }

    if (form.password && form.password !== form.konfirmasiPassword) {
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    try {
      const payload = {
        username: form.username,
        passwordLama: form.passwordLama,
        ...(form.password ? { password: form.password } : {}),
      };

      const updated = await apiFetch("/api/admin", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setAdmin(updated);
      setShowEditModal(false);
      setForm({ ...form, passwordLama: "", password: "", konfirmasiPassword: "" });
      
      alert("Profil berhasil diperbarui!");
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Animation variants seperti di file pertama
  const modalBg = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1 }, 
    exit: { opacity: 0 } 
  };
  
  const modalCard = { 
    hidden: { y: 20, opacity: 0, scale: 0.95 }, 
    visible: { y: 0, opacity: 1, scale: 1 }, 
    exit: { y: 10, opacity: 0, scale: 0.95 } 
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#622F10]/10">
        <p className="text-[#622F10] italic text-lg">Memuat profil...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#622F10]/10 p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#622F10]/20 p-8 w-full max-w-md relative">
        <h1 className="text-3xl font-extrabold mb-4 text-[#622F10] tracking-tight">
          Profil Admin
        </h1>
        
        {/* Info tambahan seperti di file pertama */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-[#622F10]">Username:</span> {admin?.username || "-"}
          </p>
          {admin?.created_at && (
            <p className="text-gray-500 text-sm">
              Bergabung sejak {new Date(admin.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#622F10] hover:bg-[#7D4325] text-white rounded-2xl shadow-lg transition-all duration-300 font-medium"
          >
            <Edit size={18} /> Edit Profil
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-all duration-300 font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Modal Edit Profil dengan animation seperti di file pertama */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            variants={modalBg}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-[#622F10]/20"
              variants={modalCard}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>

              <h3 className="text-xl font-bold mb-4 text-[#622F10]">Edit Profil</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 focus:border-[#622F10]/30 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    name="passwordLama"
                    value={form.passwordLama}
                    onChange={handleChange}
                    placeholder="Masukkan password lama untuk konfirmasi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 focus:border-[#622F10]/30 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin mengganti"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 focus:border-[#622F10]/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="konfirmasiPassword"
                    value={form.konfirmasiPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi password baru"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 focus:border-[#622F10]/30 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#622F10] hover:bg-[#7D4325] text-white font-semibold transition-all duration-300"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}