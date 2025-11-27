import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "./../server";
import FilterPesananModal from "./../components/FilterPesananModal";

const LaporanPesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    tanggalAwal: "",
    tanggalAkhir: "",
    hargaMin: "",
    hargaMax: "",
    produkId: "",
    userId: ""
  });

  const reportRef = useRef(null);

  // Fetch laporan pesanan dari API
  const fetchLaporanPesanan = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/api/pesanan");
      setPesanan(response.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat laporan pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanPesanan();
  }, []);

  // Filter pesanan berdasarkan filters
  const filteredPesanan = pesanan.filter(order => {
    // Filter tanggal
    if (filters.tanggalAwal) {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (orderDate < filters.tanggalAwal) return false;
    }

    if (filters.tanggalAkhir) {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (orderDate > filters.tanggalAkhir) return false;
    }

    // Filter harga
    if (filters.hargaMin && order.total_harga < parseInt(filters.hargaMin)) return false;
    if (filters.hargaMax && order.total_harga > parseInt(filters.hargaMax)) return false;

    // Filter produk
    if (filters.produkId) {
      const hasProduct = order.items?.some(item => item.id_produk === parseInt(filters.produkId));
      if (!hasProduct) return false;
    }

    // Filter user
    if (filters.userId) {
      if (!order.petugas || order.petugas.id_petugas !== filters.userId) {
        return false;
      }
    }

    return true;
  });

  // Hitung total item terjual
  const totalItemTerjual = filteredPesanan.reduce((total, order) => {
    return total + (order.items?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0);
  }, 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date only (without time)
  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle pesanan click
  const handlePesananClick = (order) => {
    setSelectedPesanan(order);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPesanan(null);
  };

  // Handle filter application
  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
  };

  // Check if any filter is active
  const isFilterActive = Object.values(filters).some(value => value !== "");

  // Hitung total pendapatan
  const totalPendapatan = filteredPesanan.reduce((total, order) => total + (order.total_harga || 0), 0);

  // Fungsi untuk print langsung
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan tombol print */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Pesanan</h1>
            <p className="text-gray-600">Daftar semua pesanan yang telah dilaporkan</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={filteredPesanan.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Area yang akan di-print (hidden saat print) */}
        <div className="hidden print:block">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Laporan Pesanan</h1>
            <p className="text-gray-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
            {isFilterActive && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Filter aktif diterapkan</p>
              </div>
            )}
          </div>
        </div>

        {/* Content untuk Print */}
        <div ref={reportRef}>
          {/* Summary Cards - Hidden saat print */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 print:hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredPesanan.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPendapatan)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Item Terjual</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItemTerjual}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Filter</p>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="mt-1 w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center justify-center"
                  >
                    Buka Filter
                    {isFilterActive && (
                      <span className="ml-2 bg-white text-purple-600 rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary untuk Print */}
          <div className="hidden print:grid print:grid-cols-3 print:gap-4 print:mb-6">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium">Total Pesanan</p>
              <p className="text-2xl font-bold">{filteredPesanan.length}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium">Total Pendapatan</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPendapatan)}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium">Item Terjual</p>
              <p className="text-2xl font-bold">{totalItemTerjual}</p>
            </div>
          </div>

          {/* Filter Status */}
          {isFilterActive && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg print:bg-white print:border print:border-gray-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-yellow-800 print:text-gray-800">
                    Filter aktif diterapkan
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filters.tanggalAwal && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-gray-800">
                        Dari: {formatDateOnly(filters.tanggalAwal)}
                      </span>
                    )}
                    {filters.tanggalAkhir && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-gray-800">
                        Sampai: {formatDateOnly(filters.tanggalAkhir)}
                      </span>
                    )}
                    {filters.hargaMin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-gray-800">
                        Min: {formatCurrency(parseInt(filters.hargaMin))}
                      </span>
                    )}
                    {filters.hargaMax && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-gray-800">
                        Max: {formatCurrency(parseInt(filters.hargaMax))}
                      </span>
                    )}
                    {filters.produkId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-gray-800">
                        Filter Produk
                      </span>
                    )}
                    {filters.userId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-gray-800">
                        Filter Petugas
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleApplyFilter({
                    tanggalAwal: "",
                    tanggalAkhir: "",
                    hargaMin: "",
                    hargaMax: "",
                    produkId: "",
                    userId: ""
                  })}
                  className="text-sm text-yellow-800 hover:text-yellow-900 font-medium print:hidden"
                >
                  Hapus Semua Filter
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : filteredPesanan.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {isFilterActive ? "Tidak ada pesanan yang sesuai dengan filter" : "Belum ada pesanan"}
                </h3>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPesanan.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer print:p-3 print:hover:bg-white"
                    onClick={() => handlePesananClick(order)}
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">Pesanan #{order.id}</h3>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          {formatCurrency(order.total_harga)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-xs">
                              {order.petugas?.fullname?.charAt(0) || order.petugas?.username?.charAt(0) || 'P'}
                            </span>
                          </div>
                          <span className="text-gray-600">
                            {order.petugas?.fullname || order.petugas?.username || 'Petugas'}
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {order.items?.length || 0} items
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-blue-600 font-medium print:hidden">
                          Klik untuk lihat detail →
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateOnly(order.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">Pesanan #{order.id}</h3>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center print:bg-gray-200">
                          <span className="text-blue-600 font-medium text-sm print:text-gray-700">
                            {order.petugas?.fullname?.charAt(0) || order.petugas?.username?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.petugas?.fullname || order.petugas?.username || 'Petugas'}
                          </p>
                          <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full print:bg-gray-200">
                          {order.items?.length || 0} Produk
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium print:bg-gray-200 print:text-gray-800">
                          {formatCurrency(order.total_harga)}
                        </span>
                        <p className="text-xs text-blue-600 mt-1 print:hidden">Klik untuk detail</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Footer */}
            {!loading && filteredPesanan.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 print:bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Menampilkan <span className="font-medium">{filteredPesanan.length}</span> pesanan
                    {isFilterActive && <span className="text-gray-400"> • Filter aktif</span>}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 sm:mt-0">
                    <p className="text-sm font-medium text-gray-900">
                      Total Item: <span className="text-orange-600">{totalItemTerjual}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Total Pendapatan: <span className="text-green-600">{formatCurrency(totalPendapatan)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Detail Pesanan */}
        {showModal && selectedPesanan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 print:hidden">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detail Pesanan #{selectedPesanan.id}</h2>
                  <p className="text-gray-600 mt-1">{formatDate(selectedPesanan.created_at)}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informasi Petugas</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {selectedPesanan.petugas?.fullname?.charAt(0) || selectedPesanan.petugas?.username?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedPesanan.petugas?.fullname || selectedPesanan.petugas?.username || 'Petugas'}
                      </p>
                      <p className="text-sm text-gray-500">Petugas</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Detail Items ({selectedPesanan.items?.length || 0})</h3>
                  <div className="space-y-3">
                    {selectedPesanan.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.produk?.nama_produk || 'Produk'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Jumlah: {item.jumlah}</span>
                            <span>Harga: {formatCurrency(item.harga_satuan)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(item.subtotal)}
                          </p>
                          <p className="text-xs text-gray-500">Subtotal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Pesanan</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedPesanan.total_harga)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        <FilterPesananModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
          currentFilters={filters}
        />
      </div>

      {/* CSS untuk Print */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:grid {
            display: grid !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-3 {
            padding: 0.75rem !important;
          }
          .print\\:bg-gray-200 {
            background-color: #f3f4f6 !important;
          }
          .print\\:text-gray-700 {
            color: #374151 !important;
          }
          .print\\:text-gray-800 {
            color: #1f2937 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LaporanPesanan;