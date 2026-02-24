import { useEffect, useState } from "react";
import { apiFetch } from "@/server";
import { Plus, Trash2, Star, StarOff, Pencil } from "lucide-react";
import ModalAddProduk from "@/components/produk/ModalAddProduk";
import EditProdukModal from "@/components/produk/ModalEditProduk";
import ProdukTable from "@/components/produk/ProdukTable"; 

export default function Menu() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduk, setEditingProduk] = useState(null); // produk untuk edit
  const [searchTerm, setSearchTerm] = useState("");

  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";
  const bgLight = "#F7EFEA";

  const fetchProduk = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/produk");

      const formatted = data.map((item) => ({
        ...item,
        is_best_seller: item.is_best_seller === "1",
      }));

      setProduk(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus produk ini?"
    );
    if (!confirmDelete) return;

    try {
      await apiFetch(`/api/produk/${id}`, { method: "DELETE" });
      fetchProduk();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleBestSeller = async (id) => {
    try {
      await apiFetch(`/api/produk/best-seller/${id}`, { method: "PUT" });
      fetchProduk();
    } catch (err) {
      console.error("Gagal toggle best seller:", err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingProduk(item); // set data yang mau diedit
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduk(null);
    setShowModal(true);
  };

  const filteredProduk = produk.filter((item) =>
    item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
     <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: primary }}>
          Daftar Menu
        </h1>

        {/* Search & Add */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#622F10] placeholder-gray-400 transition"
          />

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[#622F10] hover:bg-[#8B4A23] text-white px-4 py-2 rounded-xl shadow-md transition transform hover:scale-105"
          >
            <Plus size={18} />
            <span>Tambah</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ProdukTable
          data={filteredProduk}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleBestSeller={handleToggleBestSeller}
        />
      </div>

      {/* Modal Tambah / Edit Produk */}
      {/* Modal Tambah */}
      {showModal && !editingProduk && (
        <ModalAddProduk
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreated={(data) => {
            fetchProduk();
            setShowModal(false);
          }}
        />
      )}

      {/* Modal Edit */}
      {showModal && editingProduk && (
        <EditProdukModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editingProduk={editingProduk}
          onUpdated={(data) => {
            fetchProduk();
            setShowModal(false);
          }}
        />
      )}

    </div>
  );
}
