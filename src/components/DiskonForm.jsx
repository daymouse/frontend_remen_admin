// 📁 src/components/DiskonFormModal.jsx
import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";

export default function DiskonFormModal({ onSubmit, diskon, onCancel, isOpen }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    nama_diskon: "",
    tipe_diskon: "persentase",
    persentase: "",
    harga_tetap: "",
    tanggal_mulai: today,
    tanggal_selesai: "",
    status: "aktif",
  });

  // ⏱️ Isi data saat mode edit
  useEffect(() => {
    if (diskon) {
      setForm({
        nama_diskon: diskon.nama_diskon || "",
        tipe_diskon: diskon.tipe_diskon || "persentase",
        persentase: diskon.persentase || "",
        harga_tetap: diskon.harga_tetap || "",
        tanggal_mulai: diskon.tanggal_mulai || today,
        tanggal_selesai: diskon.tanggal_selesai || "",
        status: diskon.status || "aktif",
      });
    } else {
      // reset ke default jika tambah baru
      setForm({
        nama_diskon: "",
        tipe_diskon: "persentase",
        persentase: "",
        harga_tetap: "",
        tanggal_mulai: today,
        tanggal_selesai: "",
        status: "aktif",
      });
    }
  }, [diskon]);

  // 🔧 Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let updated = { ...prev, [name]: value };

      // tanggal_selesai tidak boleh < tanggal_mulai
      if (name === "tanggal_mulai" && prev.tanggal_selesai < value) {
        updated.tanggal_selesai = value;
      }

      return updated;
    });
  };

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // 🚪 Jika modal tidak dibuka, jangan render apapun
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title={diskon ? "Edit Diskon" : "Tambah Diskon"}
      subtitle="Lengkapi informasi diskon produk"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            form="diskonForm"
            className="px-5 py-2 rounded-xl bg-[#622F10] hover:bg-[#4E230C] text-white shadow-md transition"
          >
            Simpan
          </button>
        </div>
      }
    >
      <form
        id="diskonForm"
        onSubmit={handleSubmit}
        className="space-y-4 text-gray-800"
      >
        {/* Nama Diskon */}
        <div>
          <label className="block text-sm font-medium">Nama Diskon</label>
          <input
            type="text"
            name="nama_diskon"
            placeholder="Nama Diskon"
            value={form.nama_diskon}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
          />
        </div>

        {/* Tipe Diskon */}
        <div>
          <label className="block text-sm font-medium">Tipe Diskon</label>
          <select
            name="tipe_diskon"
            value={form.tipe_diskon}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
          >
            <option value="persentase">Persentase</option>
            <option value="harga_tetap">Harga Tetap</option>
          </select>
        </div>

        {/* Persentase */}
        {form.tipe_diskon === "persentase" && (
          <div>
            <label className="block text-sm font-medium">
              Persentase Diskon (%)
            </label>
            <input
              type="number"
              name="persentase"
              placeholder="Masukkan persentase"
              value={form.persentase}
              onChange={handleChange}
              min="1"
              max="100"
              required
              className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
            />
          </div>
        )}

        {/* Harga Tetap */}
        {form.tipe_diskon === "harga_tetap" && (
          <div>
            <label className="block text-sm font-medium">Harga Tetap (Rp)</label>
            <input
              type="number"
              name="harga_tetap"
              placeholder="Masukkan harga tetap"
              value={form.harga_tetap}
              onChange={handleChange}
              min="0"
              required
              className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
            />
          </div>
        )}

        {/* Tanggal Mulai */}
        <div>
          <label className="block text-sm font-medium">Tanggal Mulai</label>
          <input
            type="date"
            name="tanggal_mulai"
            value={form.tanggal_mulai}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
          />
        </div>

        {/* Tanggal Selesai */}
        <div>
          <label className="block text-sm font-medium">Tanggal Selesai</label>
          <input
            type="date"
            name="tanggal_selesai"
            value={form.tanggal_selesai}
            onChange={handleChange}
            min={form.tanggal_mulai}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium">Status Diskon</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </form>
    </BaseModal>
  );
}
