import { useState } from "react";
import { X } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalAddProduk({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    nama_produk: "",
    harga: "",
    deskripsi: "",
    status: "tersedia",
  });
  const [gambar, setGambar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gambar) {
      setError("Gambar wajib diupload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("nama_produk", form.nama_produk);
      formData.append("harga", form.harga);
      formData.append("deskripsi", form.deskripsi);
      formData.append("gambar", gambar, "produk.png");

      const res = await fetch("https://backend-remen-admin.vercel.app/api/produk", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menambah produk");
      }

      const data = await res.json();
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
        >
          {/* Modal Card */}
          <motion.div
            key="modalContent"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg p-6"
          >
            {/* Tombol Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Tambah Produk
              </h2>
              <p className="text-sm text-gray-500">
                Lengkapi data produk baru kamu
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 mb-3 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="nama_produk"
                  value={form.nama_produk}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Harga
                </label>
                <input
                  type="number"
                  name="harga"
                  value={form.harga}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload & Crop Gambar
                </label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-orange-400 transition">
                  <ImageUploader onChange={setGambar} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition disabled:opacity-60"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
