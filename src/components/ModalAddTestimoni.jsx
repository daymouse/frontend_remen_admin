import { useState } from "react";
import { apiFetch } from "../server";
import BaseModal from "./BaseModal";

export default function ModalAddTestimoni({ isOpen, onClose, onAdded }) {
  const [form, setForm] = useState({ nama: "", isi: "", rating: 5 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/api/testimoni", {
        method: "POST",
        body: JSON.stringify(form),
      });

      onAdded?.(); // refresh data parent
      onClose?.(); // tutup modal
    } catch (err) {
      alert("❌ Gagal menambahkan testimoni: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Tambah Testimoni">
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
            className="px-3 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-3 py-2 rounded bg-[#6b3a1d] text-white hover:bg-[#8B4A23]"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
