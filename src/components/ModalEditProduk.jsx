import { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import ImageUploader from "./ImageUploader";

export default function EditProdukModal({
  isOpen,
  onClose,
  onUpdated,
  editingProduk,
}) {
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
      setError(null);
    }
  }, [editingProduk]);

  if (!isOpen || !editingProduk) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

      const res = await fetch(
        `https://backend-remen-admin.vercel.app/api/produk/${editingProduk.id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal mengupdate produk");
      }

      const data = await res.json();
      onUpdated(data);
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
      title="Edit Produk"
      subtitle="Perbarui detail produk sesuai kebutuhan"
      width="max-w-lg"
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
            form="form-edit-produk"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[#622F10] hover:bg-[#4f230c] text-white shadow-md transition disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      }
    >
      <form
        id="form-edit-produk"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
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
            Gambar
          </label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center">
            {gambarPreview && (
              <img
                src={gambarPreview}
                alt="preview"
                className="mb-2 w-32 h-32 object-contain"
              />
            )}
            <ImageUploader
              onChange={(file) => {
                setGambarFile(file);
                setGambarPreview(URL.createObjectURL(file));
              }}
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
