import { useState } from "react";
import BaseModal from "./BaseModal";
import ImageUploader from "./ImageUploader";

export default function ModalAddProduk({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    nama_produk: "",
    harga: "",
    deskripsi: "",
  });
  const [gambar, setGambar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gambar) return setError("Gambar wajib diupload");

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);
      formData.append("gambar", gambar, "produk.png");

      const res = await fetch("https://backend-remen-admin.vercel.app/api/produk", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah produk");

      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Produk"
      subtitle="Lengkapi data produk baru kamu"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            form="produkForm"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[#622F10] hover:bg-[#4E230C] text-white shadow-md transition disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      }
    >
      <form id="produkForm" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama Produk
          </label>
          <input
            type="text"
            name="nama_produk"
            value={form.nama_produk}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
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
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
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
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload & Crop Gambar
          </label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-[#622F10]/60 transition">
            <ImageUploader onChange={setGambar} />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
