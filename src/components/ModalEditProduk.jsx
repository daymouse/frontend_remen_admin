import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProdukModal({ isOpen, onClose, onUpdated, editingProduk }) {
  const [form, setForm] = useState({
    nama_produk: "",
    harga: "",
    deskripsi: "",
    status: "aktif",
  });
  const [gambarFile, setGambarFile] = useState(null);
  const [gambarPreview, setGambarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingProduk) {
      setForm({
        nama_produk: editingProduk.nama_produk || "",
        harga: editingProduk.harga || "",
        deskripsi: editingProduk.deskripsi || "",
        status: editingProduk.status || "aktif",
      });
      setGambarPreview(editingProduk.gambar || null);
      setGambarFile(null);
    }
    setError(null);
  }, [editingProduk]);

  if (!isOpen || !editingProduk) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("nama_produk", form.nama_produk);
    formData.append("harga", form.harga);
    formData.append("deskripsi", form.deskripsi);
    formData.append("status", form.status);

    if (gambarFile) {
      formData.append("gambar", gambarFile, "produk.png");
    }

    const res = await fetch(`http://localhost:3000/api/produk/${editingProduk.id}`, {
      method: "PUT",
      body: formData,
      credentials: "include", 
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Gagal mengupdate produk");
    }

    const data = await res.json();
    onUpdated(data); // callback agar data di Menu.jsx terupdate
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
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <motion.div className="relative bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg p-6"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition">
              <X size={20} />
            </button>

            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">Edit Produk</h2>

            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                <input type="text" name="nama_produk" value={form.nama_produk} onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-100 outline-none transition"
                  required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <input type="number" name="harga" value={form.harga} onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-100 outline-none transition"
                  required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-100 outline-none transition"
                  required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gambar</label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center">
                  {gambarPreview && <img src={gambarPreview} alt="preview" className="mb-2 w-32 h-32 object-contain" />}
                  <ImageUploader onChange={(file) => {
                    setGambarFile(file);
                    setGambarPreview(URL.createObjectURL(file));
                  }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition disabled:opacity-60">
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
