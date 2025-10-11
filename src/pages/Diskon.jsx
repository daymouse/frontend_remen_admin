import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash,
  Percent,
  Tag,
  XCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
import DiskonForm from "../components/DiskonForm.jsx";
import { apiFetch } from "./../server.jsx";

export default function Diskon() {
  const [diskons, setDiskons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDiskon, setEditingDiskon] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [produkTanpaDiskon, setProdukTanpaDiskon] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState([]);
  const [applyDiskonId, setApplyDiskonId] = useState(null);
  const [detailDiskon, setDetailDiskon] = useState(null);
  const [produkDiskon, setProdukDiskon] = useState([]);
  const [loadingProdukDiskon, setLoadingProdukDiskon] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProduk = produkTanpaDiskon.filter((p) =>
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProdukDiskon = produkDiskon.filter((p) =>
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [loadingApply, setLoadingApply] = useState(false);



  const primary = "#622F10"; // warna dominan
  const hoverPrimary = "#8B4A23"; // hover senada
  const bgLight = "#F7EFEA"; // background lembut

  // === Fetch Diskon ===
  const fetchDiskons = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/diskon");
      setDiskons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.message);
      setDiskons([]);
    } finally {
      setLoading(false);
    }
  };

  // === Fetch Produk tanpa diskon ===
  const fetchProdukTanpaDiskon = async () => {
    try {
      const res = await apiFetch("/api/diskon/getProdukTanpaDiskon");
      setProdukTanpaDiskon(res.data || []);
    } catch (err) {
      console.error(err.message);
      setProdukTanpaDiskon([]);
    }
  };

  // === Fetch produk berdasarkan diskon ===
  const fetchProdukByDiskon = async (diskonId) => {
    setLoadingProdukDiskon(true);
    try {
      const res = await apiFetch(`/api/diskon/${diskonId}/produk`);
      setProdukDiskon(res.data || []);
    } catch (err) {
      console.error(err.message);
      setProdukDiskon([]);
    } finally {
      setLoadingProdukDiskon(false);
    }
  };

  useEffect(() => {
    fetchDiskons();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus diskon ini?")) return;
    try {
      await apiFetch(`/api/diskon/${id}`, { method: "DELETE" });
      fetchDiskons();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSubmit = async (form) => {
    try {
      if (editingDiskon) {
        await apiFetch(`/api/diskon/${editingDiskon.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/api/diskon", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      setEditingDiskon(null);
      fetchDiskons();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleOpenApplyDiskon = async (diskonId) => {
    setApplyDiskonId(diskonId);
    setSelectedProduk([]);
    await fetchProdukTanpaDiskon();
  };

  const handleCheckboxChange = (id) => {
    setSelectedProduk((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleApplyDiskon = async () => {
    if (selectedProduk.length === 0) {
      alert("Pilih minimal 1 produk!");
      return;
    }

    try {
      setLoadingApply(true); // mulai loading
      await apiFetch("/api/diskon/produk", {
        method: "PATCH",
        body: JSON.stringify({
          diskon_id: applyDiskonId,
          produk_id: selectedProduk,
        }),
      });

      
      await fetchProdukByDiskon(applyDiskonId); 
      alert("Diskon berhasil diterapkan!");
      setApplyDiskonId(null);
      setSelectedProduk([]);
    } catch (err) {
      console.error(err.message);
      alert("Gagal menerapkan diskon");
    } finally {
      setLoadingApply(false); 
    }
  };


  const handleOpenDetail = async (diskon) => {
    setDetailDiskon(diskon);
    setProdukDiskon([]);
    await fetchProdukByDiskon(diskon.id);
  };

  const handleCloseDetail = () => {
    setDetailDiskon(null);
    setProdukDiskon([]);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: primary }}>
          Manajemen Diskon
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingDiskon(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-md text-white transition transform hover:scale-105"
          style={{ backgroundColor: primary }}
        >
          <Plus size={18} />
          Tambah Diskon
        </button>
      </div>

      {/* FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="formOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              key="diskonForm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md shadow-lg"
            >
              <DiskonForm
                diskon={editingDiskon}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingDiskon(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIST DISKON */}
      {loading ? (
        <p className="text-gray-500 italic">Memuat data...</p>
      ) : diskons.length === 0 ? (
        <p className="text-gray-600 italic">Belum ada diskon yang terdaftar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {diskons.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-2xl p-4 border hover:shadow-xl transition flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-lg text-gray-800">
                  {d.nama_diskon}
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    d.status === "aktif"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <div className="space-y-1 text-gray-600 text-sm mb-3">
                <p className="flex items-center gap-1">
                  <Tag size={14} />{" "}
                  {d.tipe_diskon === "persentase"
                    ? `${d.persentase}%`
                    : `Rp${d.harga_tetap}`}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Percent size={12} /> {d.tanggal_mulai} - {d.tanggal_selesai}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOpenDetail(d)}
                  className="flex items-center gap-1 text-white px-3 py-1 rounded-lg shadow transition"
                  style={{ backgroundColor: primary }}
                >
                  <Eye size={16} /> Detail
                </button>
                <button
                  onClick={() => {
                    setEditingDiskon(d);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg transition shadow"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition shadow"
                >
                  <Trash size={16} /> Hapus
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL PRODUK DISKON & TERAPKAN */}
        <AnimatePresence>
          {detailDiskon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-2"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Produk dengan Diskon: {detailDiskon.nama_diskon}
                  </h2>
                  <button
                    onClick={handleCloseDetail}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                  >
                    <XCircle size={22} /> Tutup
                  </button>
                </div>

                {/* Search Input */}
                <div className="px-6 py-4 border-b">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10]/50 shadow-sm transition"
                  />
                </div>

                {/* Content Produk */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="my-2">
                    <button
                      onClick={() => handleOpenApplyDiskon(detailDiskon.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow text-white w-full"
                      style={{ backgroundColor: primary }}
                    >
                      <CheckCircle size={18} /> Terapkan ke Produk
                    </button>
                  </div>

                  {loadingProdukDiskon ? (
                    <p className="text-gray-500 italic">Memuat produk...</p>
                  ) : filteredProdukDiskon.length === 0 ? (
                    <p className="text-gray-500 italic">
                      Belum ada produk yang memakai diskon ini.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredProdukDiskon.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white border rounded-2xl shadow-sm p-3 flex flex-col hover:shadow-md transition"
                        >
                          <img
                            src={p.gambar || "/no-image.png"}
                            alt={p.nama_produk}
                            className="h-28 sm:h-32 object-cover rounded-md mb-2"
                          />
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">
                            {p.nama_produk}
                          </h4>
                          <p className="text-xs text-gray-500 line-through">
                            Rp{p.harga.toLocaleString("id-ID")}
                          </p>
                          <p className="text-green-600 font-semibold">
                            Rp{p.harga_akhir?.toLocaleString("id-ID") || "—"}
                          </p>

                          {/* Tombol Hapus Diskon */}
                          <button
                            onClick={async () => {
                              if (!confirm(`Hapus diskon dari ${p.nama_produk}?`)) return;
                              try {
                                await apiFetch("/api/diskon/produk/remove", {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    diskon_id: detailDiskon.id,
                                    produk_id: p.id,
                                  }),
                                });
                                fetchProdukByDiskon(detailDiskon.id);
                              } catch (err) {
                                console.error(err.message);
                                alert("Gagal menghapus diskon dari produk");
                              }
                            }}
                            className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-xl transition"
                          >
                            Hapus Diskon
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      {/* MODAL TERAPKAN DISKON */}
      <AnimatePresence>
        {applyDiskonId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[80vh]"
            >
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Terapkan Diskon ke Produk
              </h2>

              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Checkbox Semua */}
              <div className="flex items-center mb-3 border-b pb-2">
                <input
                  type="checkbox"
                  checked={
                    selectedProduk.length === filteredProduk.length &&
                    filteredProduk.length > 0
                  }
                  onChange={(e) =>
                    setSelectedProduk(
                      e.target.checked
                        ? filteredProduk.map((p) => p.id)
                        : []
                    )
                  }
                  className="w-4 h-4 accent-green-600"
                />
                <label className="ml-2 text-gray-700 font-medium">
                  Pilih Semua Produk
                </label>
              </div>

              {/* List Produk */}
              <div className="max-h-72 overflow-y-auto border rounded-md p-3 bg-gray-50">
                {filteredProduk.length === 0 ? (
                  <p className="text-gray-500 italic">Tidak ada produk yang cocok.</p>
                ) : (
                  filteredProduk.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center justify-between border-b py-2 px-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProduk.includes(p.id)}
                          onChange={() => handleCheckboxChange(p.id)}
                          className="w-4 h-4 accent-green-600"
                        />
                        <img
                          src={p.gambar || "/no-image.png"}
                          alt={p.nama_produk}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                        <div>
                          <p className="text-gray-800 font-medium text-sm">
                            {p.nama_produk}
                          </p>
                          <p className="text-gray-600 text-xs">
                            Rp{p.harga.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Tombol */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setApplyDiskonId(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  disabled={selectedProduk.length === 0}
                  onClick={handleApplyDiskon}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1 ${
                    selectedProduk.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  <CheckCircle size={18} /> Terapkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
