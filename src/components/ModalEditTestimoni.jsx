import { useState } from "react";
import { apiFetch } from "../server"; 

export default function ModalEditTestimoni({ data, onClose, onUpdated }) {
  const [form, setForm] = useState({
    nama: data.nama,
    isi: data.isi,
    rating: data.rating,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(`/api/testimoni/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Gagal mengedit testimoni:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] md:w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-center text-[#6b3a1d]">
          Edit Testimoni
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <textarea
            placeholder="Isi testimoni"
            value={form.isi}
            onChange={(e) => setForm({ ...form, isi: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <select
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: parseInt(e.target.value) })
            }
            className="border p-2 rounded"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} ⭐
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded bg-[#6b3a1d] text-white"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
