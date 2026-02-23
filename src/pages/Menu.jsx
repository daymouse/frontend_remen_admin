import { useEffect, useState } from "react";
import { apiFetch } from "../server";
import { Plus, Trash2, Star, StarOff, Pencil } from "lucide-react";
import ModalAddProduk from "../components/ModalAddProduk";
import EditProdukModal from "../components/ModalEditProduk"; 

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
      setProduk(data);
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
    <div className="relative p-4 sm:p-6 md:p-8 h-screen flex flex-col">
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

      {/* Grid Produk */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProduk.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
            >
              {/* Gambar */}
              <div className="h-40 sm:h-48 w-full overflow-hidden flex items-center justify-center bg-gray-100">
                {item.gambar ? (
                  <img
                    src={item.gambar}
                    alt={item.nama_produk}
                    className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              {/* Konten */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-1">{item.nama_produk}</h2>
                  <p className="text-gray-600 text-sm mb-3 truncate">{item.deskripsi}</p>

                  {item.id_diskon ? (
                    <div>
                      <p className="text-base sm:text-lg font-bold" style={{ color: primary }}>
                        Rp {parseFloat(item.harga_final).toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-gray-400 line-through">
                        Rp {parseFloat(item.harga).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg font-bold" style={{ color: primary }}>
                      Rp {parseFloat(item.harga).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>

                {/* Tombol aksi */}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition shadow-md"
                    title="Edit Produk"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-md"
                    title="Hapus Produk"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => handleToggleBestSeller(item.id)}
                    className={`p-2 rounded-full text-white transition shadow-md ${
                      item.is_best_seller
                        ? "bg-yellow-400 hover:bg-yellow-500"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                    title="Best Seller"
                  >
                    {item.is_best_seller ? <Star size={18} /> : <StarOff size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProduk.length === 0 && (
            <p className="col-span-full text-center text-gray-500 mt-4">
              Produk tidak ditemukan.
            </p>
          )}
        </div>
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
