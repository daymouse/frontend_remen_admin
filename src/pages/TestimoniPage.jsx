import { useEffect, useState } from "react";
import { apiFetch } from "./../server";
import ModalAddTestimoni from "./../components/ModalAddTestimoni";
import ModalEditTestimoni from "./../components/ModalEditTestimoni";

export default function TestimoniPage() {
  const [testimoni, setTestimoni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/testimoni");
      setTestimoni(data);
    } catch (err) {
      console.error("❌ Gagal memuat testimoni:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus testimoni ini?")) return;
    try {
      await apiFetch(`/api/testimoni/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      alert("❌ Gagal menghapus: " + err.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#6b3a1d] mb-6">
        Testimoni Pelanggan
      </h1>

      <button
        onClick={() => setIsAddOpen(true)}
        className="mb-6 px-4 py-2 bg-[#6b3a1d] text-white rounded-lg shadow hover:opacity-90"
      >
        + Tambah Testimoni
      </button>

      {/* Daftar Testimoni */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {testimoni.map((item) => (
          <div
            key={item.id}
            className="bg-[#6b3a1d] text-white rounded-2xl shadow-lg p-6 text-center relative"
          >
            <h3 className="text-lg font-bold">{item.nama}</h3>
            <p className="italic mt-2 text-sm opacity-90">“{item.isi}”</p>
            <div className="mt-3 text-yellow-400">
              {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => {
                  setSelected(item);
                  setIsEditOpen(true);
                }}
                className="bg-yellow-500 text-black text-sm px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 text-white text-sm px-2 py-1 rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      <ModalAddTestimoni
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={fetchData}
      />

      <ModalEditTestimoni
        isOpen={isEditOpen}
        data={selected}
        onClose={() => {
          setIsEditOpen(false);
          setSelected(null);
        }}
        onUpdated={fetchData}
      />
    </div>
  );
}
