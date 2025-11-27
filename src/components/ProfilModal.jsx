import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Edit, Lock, ArrowLeft } from "lucide-react";
import { apiFetch } from "../server.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilModal({ isOpen, onClose }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordVerification, setShowPasswordVerification] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    passwordLama: "",
    password: "",
  });
  const [verificationPassword, setVerificationPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationError, setVerificationError] = useState("");

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
    if (isOpen) {
      fetchAdmin();
      // Reset semua state ketika modal dibuka
      setShowEditModal(false);
      setShowPasswordVerification(false);
      setVerificationPassword("");
      setError("");
      setVerificationError("");
    }
  }, [isOpen]);

  const handleLogout = async () => {
    if (!confirm("Apakah yakin ingin logout?")) return;
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Fungsi untuk verifikasi password lama
  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    setVerificationError("");

    if (!verificationPassword) {
      setVerificationError("Masukkan password lama untuk melanjutkan.");
      return;
    }

    try {
      // Verifikasi password dengan API
      const payload = {
        passwordLama: verificationPassword
      };

      await apiFetch("/api/admin/verify-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Jika verifikasi berhasil, buka modal edit
      setShowPasswordVerification(false);
      setShowEditModal(true);
      setForm(prev => ({ ...prev, passwordLama: verificationPassword }));
      setVerificationPassword("");
    } catch (err) {
      setVerificationError("Password lama salah. Silakan coba lagi.");
    }
  };

  // Di bagian handleSubmit, ubah payload menjadi:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (form.password && form.password.length < 6) {
    setError("Password baru minimal 6 karakter.");
    return;
  }

  try {
    const payload = {
      username: form.username,
      ...(form.password ? { password: form.password } : {}),
    };

    const updated = await apiFetch("/api/admin", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    setAdmin(updated);
    setShowEditModal(false);
    setForm({ 
      username: updated.username, 
      password: "", 
    });
    alert("Profil berhasil diperbarui!");
  } catch (err) {
    setError(err.message);
  }
};

  // Fungsi untuk memulai proses edit profil
  const startEditProfile = () => {
    setShowPasswordVerification(true);
    setVerificationPassword("");
    setVerificationError("");
  };

  // Tutup semua modal
  const handleCloseAllModals = () => {
    setShowEditModal(false);
    setShowPasswordVerification(false);
    setError("");
    setVerificationError("");
    setVerificationPassword("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl border border-[#622F10]/20 p-8 w-full max-w-md relative mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={22} />
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-[#622F10] italic text-lg">Memuat profil...</p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold mb-4 text-[#622F10] tracking-tight">
                  Profil Admin
                </h1>
                <p className="text-gray-700 mb-6 text-lg">
                  <span className="font-semibold text-[#622F10]">Username:</span> {admin?.username || "-"}
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={startEditProfile}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#622F10] hover:bg-[#7D4325] text-white rounded-2xl shadow-lg transition-all duration-300 font-medium"
                  >
                    <Edit size={18} /> Edit Profil
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-all duration-300 font-medium"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Modal Verifikasi Password */}
          <AnimatePresence>
            {showPasswordVerification && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseAllModals}
              >
                <motion.div
                  className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-[#622F10]/20 mx-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleCloseAllModals}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={22} />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#622F10]/10 rounded-full">
                      <Lock size={20} className="text-[#622F10]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#622F10]">Verifikasi Password</h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    Masukkan password lama Anda untuk mengubah profil.
                  </p>

                  {verificationError && (
                    <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">
                      {verificationError}
                    </p>
                  )}

                  <form onSubmit={handlePasswordVerification} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Lama
                      </label>
                      <input
                        type="password"
                        value={verificationPassword}
                        onChange={(e) => setVerificationPassword(e.target.value)}
                        placeholder="Masukkan password lama Anda"
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 shadow-sm transition"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={handleCloseAllModals}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium transition-all duration-300 hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#622F10] hover:bg-[#7D4325] text-white px-4 py-2 rounded-2xl shadow-lg font-semibold transition-all duration-300"
                      >
                        Verifikasi
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Edit Profil */}
          <AnimatePresence>
            {showEditModal && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseAllModals}
              >
                <motion.div
                  className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-[#622F10]/20 mx-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleCloseAllModals}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={22} />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setShowPasswordVerification(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                      <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h3 className="text-xl font-bold text-[#622F10]">Edit Profil</h3>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">
                      {error}
                    </p>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 shadow-sm transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Kosongkan jika tidak ingin mengganti password"
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 shadow-sm transition"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimal 6 karakter
                      </p>
                    </div>

                    <div className="flex gap-3 mt-3">
                      <button
                        type="button"
                        onClick={handleCloseAllModals}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium transition-all duration-300 hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#622F10] hover:bg-[#7D4325] text-white px-4 py-2 rounded-2xl shadow-lg font-semibold transition-all duration-300"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}