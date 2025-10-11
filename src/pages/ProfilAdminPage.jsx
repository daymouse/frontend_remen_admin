import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Edit } from "lucide-react";
import { apiFetch } from "../server.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilAdminPage() {
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
    if (!confirm("Apakah yakin ingin logout?")) return;
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err.message);
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
    } catch (err) {
      setError(err.message);
    }
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
        <p className="text-gray-700 mb-6 text-lg">
          <span className="font-semibold text-[#622F10]">Username:</span> {admin?.username || "-"}
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowEditModal(true)}
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
      </div>

      {/* Modal Edit Profil */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-[#622F10]/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={22} />
              </button>

              <h3 className="text-xl font-bold mb-4 text-[#622F10]">Edit Profil</h3>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

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
                    Password Lama
                  </label>
                  <input
                    type="password"
                    name="passwordLama"
                    value={form.passwordLama}
                    onChange={handleChange}
                    placeholder="Masukkan password lama untuk konfirmasi"
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
                    placeholder="Kosongkan jika tidak ingin mengganti"
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 shadow-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="konfirmasiPassword"
                    value={form.konfirmasiPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi password baru"
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 shadow-sm transition"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-3 bg-[#622F10] hover:bg-[#7D4325] text-white px-5 py-2 rounded-2xl shadow-lg font-semibold transition-all duration-300"
                >
                  Simpan
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
