import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "./../server";

export default function TentangKami() {
  const primary = "#622F10"; // warna dominan
  const hoverPrimary = "#8B4A23"; // hover
  const [form, setForm] = useState({
    paragraf1: "",
    paragraf2: "",
    alamat: "",
    whatsapp: "",
    jam_operasional: "08.00 - 16.00",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch("/api/tentang_kami");
        setForm(data);
      } catch (err) {
        console.error("Gagal mengambil data Tentang Kami:", err.message);
        setStatus("error");
        setTimeout(() => setStatus(null), 2500);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/tentang_kami", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setStatus("success");
      setEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan data:", err.message);
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold mb-6 text-[#622F10] tracking-tight"
      >
        Tentang Kami
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/90 border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6"
      >
        {["paragraf1", "paragraf2"].map((key, i) => (
          <div key={key}>
            <label className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              Paragraf {i + 1}
            </label>
            <textarea
              name={key}
              value={form[key]}
              onChange={handleChange}
              disabled={!editing}
              rows="3"
              className={`w-full p-3 sm:p-4 rounded-2xl border transition-all duration-200 focus:ring-2 focus:ring-[#622F10] text-gray-700 ${
                editing
                  ? "bg-white border-gray-300"
                  : "bg-gray-50 border-transparent"
              }`}
              placeholder={`Tulis paragraf ${i + 1} di sini...`}
            />
          </div>
        ))}

        {["alamat", "whatsapp", "jam_operasional"].map((field) => (
          <div key={field}>
            <label className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              {field === "whatsapp"
                ? "Whatsapp"
                : field === "alamat"
                ? "Alamat"
                : "Jam Operasional"}
            </label>
            <input
              name={field}
              value={form[field]}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full p-3 sm:p-4 rounded-2xl border transition-all duration-200 focus:ring-2 focus:ring-[#622F10] text-gray-700 ${
                editing
                  ? "bg-white border-gray-300"
                  : "bg-gray-50 border-transparent"
              }`}
              placeholder={
                field === "jam_operasional"
                  ? "08.00 - 16.00"
                  : field === "alamat"
                  ? "Masukkan alamat lengkap perusahaan..."
                  : "Masukkan nomor Whatsapp..."
              }
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2.5 bg-[#622F10] hover:bg-[#8B4A23] text-white font-medium rounded-2xl shadow transition-all"
            >
              ✏️ Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-5 py-2.5 rounded-2xl font-medium text-white transition-all ${
                  loading
                    ? "bg-[#622F10]/50 cursor-not-allowed"
                    : "bg-[#622F10] hover:bg-[#8B4A23]"
                }`}
              >
                {loading ? "Menyimpan..." : "💾 Simpan"}
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Notifikasi */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-lg text-white text-sm sm:text-base ${
              status === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {status === "success"
              ? "✅ Data berhasil disimpan!"
              : "❌ Gagal menyimpan data!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
