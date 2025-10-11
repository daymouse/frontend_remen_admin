import { useState, useEffect } from "react";

export default function DiskonFormModal({ onSubmit, diskon, onCancel }) {
  const [form, setForm] = useState({
    nama_diskon: "",
    tipe_diskon: "persentase",
    persentase: "",
    harga_tetap: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "aktif"
  });

  useEffect(() => {
    if (diskon) {
      setForm({
        ...diskon,
        persentase: diskon.persentase || "",
        harga_tetap: diskon.harga_tetap || ""
      });
    }
  }, [diskon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">{diskon ? "Edit Diskon" : "Tambah Diskon"}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="nama_diskon"
            placeholder="Nama Diskon"
            value={form.nama_diskon}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />

          <select
            name="tipe_diskon"
            value={form.tipe_diskon}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="persentase">Persentase</option>
            <option value="harga_tetap">Harga Tetap</option>
          </select>

          {form.tipe_diskon === "persentase" && (
            <input
              type="number"
              name="persentase"
              placeholder="Persentase"
              value={form.persentase}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          )}

          {form.tipe_diskon === "harga_tetap" && (
            <input
              type="number"
              name="harga_tetap"
              placeholder="Harga Tetap"
              value={form.harga_tetap}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          )}

          <input
            type="date"
            name="tanggal_mulai"
            value={form.tanggal_mulai}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          <input
            type="date"
            name="tanggal_selesai"
            value={form.tanggal_selesai}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
