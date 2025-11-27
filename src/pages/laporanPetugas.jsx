import React, { useState, useEffect } from "react";
import { apiFetch } from "./../server";

const LaporanPesananHarian = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch user data petugas
  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      console.log("🔄 Fetching user data...");
      
      const response = await apiFetch("/auth/me-petugas", {
        method: "GET",
      });
      
      console.log("✅ User data response:", response);
      console.log("📋 Response structure:", {
        hasMessage: !!response.message,
        hasUser: !!response.user,
        userData: response.user
      });
      
      if (response && response.user) {
        console.log("🎯 Setting user data:", response.user);
        setUserData(response.user);
      } else if (response && response.message) {
        console.warn("⚠️ Response ada tapi tidak ada user property:", response);
        setUserData(response);
      } else {
        throw new Error("Struktur data user tidak valid: " + JSON.stringify(response));
      }
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
      setError("Gagal memuat data pengguna: " + err.message);
    } finally {
      setUserLoading(false);
      console.log("🏁 User loading finished, userData:", userData);
    }
  };

  // Fetch laporan pesanan dari API
  const fetchLaporanPesanan = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/api/pesanan/petugas");
      setPesanan(response.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat laporan pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchLaporanPesanan();
  }, []);

  // Fungsi untuk mendapatkan username petugas yang login
  const getPetugasName = () => {
    if (!userData) return "Petugas";
    
    // Cek berbagai kemungkinan struktur data
    if (userData.fullname) {
      return userData.fullname;
    } else if (userData.username) {
      return userData.username;
    } else if (userData.name) {
      return userData.name;
    } else if (userData.user && userData.user.fullname) {
      return userData.user.fullname;
    } else if (userData.user && userData.user.username) {
      return userData.user.username;
    }
    
    return "Petugas";
  };

  // Fungsi untuk mendapatkan kelas petugas
  const getPetugasKelas = () => {
    if (!userData) return null;
    
    return userData.kelas || userData.user?.kelas || null;
  };

  // Fungsi untuk parsing tanggal yang aman
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    const cleanedDate = dateString.replace(/\.\d+/, '');
    const date = new Date(cleanedDate);
    
    if (isNaN(date.getTime())) {
      const parts = cleanedDate.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];
        return new Date(`${datePart}T${timePart}Z`);
      }
      return new Date();
    }
    
    return date;
  };

  // Kelompokkan pesanan berdasarkan tanggal
  const groupedPesanan = pesanan.reduce((groups, order) => {
    const date = parseDate(order.created_at).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(order);
    return groups;
  }, {});

  // Urutkan tanggal dari terbaru ke terlama
  const sortedDates = Object.keys(groupedPesanan).sort((a, b) => {
    const dateA = parseDate(a.split('/').reverse().join('-'));
    const dateB = parseDate(b.split('/').reverse().join('-'));
    return dateB - dateA;
  });

  // Hitung statistik per hari
  const dailyStats = sortedDates.map(date => {
    const orders = groupedPesanan[date];
    const totalPendapatan = orders.reduce((total, order) => total + (order.total_harga || 0), 0);
    const totalItemTerjual = orders.reduce((total, order) => {
      return total + (order.items?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0);
    }, 0);

    return {
      date,
      totalPesanan: orders.length,
      totalPendapatan,
      totalItemTerjual
    };
  });

  // Hitung total keseluruhan
  const totalKeseluruhan = {
    totalPesanan: pesanan.length,
    totalPendapatan: pesanan.reduce((total, order) => total + (order.total_harga || 0), 0),
    totalItemTerjual: pesanan.reduce((total, order) => {
      return total + (order.items?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0);
    }, 0)
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date dengan hari
  const formatDateWithDay = (dateString) => {
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      }
      
      const date = parseDate(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  // Format date dengan waktu
  const formatDateTime = (dateString) => {
    try {
      const date = parseDate(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Tanggal tidak valid';
    }
  };

  // Format hanya waktu
  const formatTime = (dateString) => {
    try {
      const date = parseDate(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
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

  // Fungsi untuk print langsung
  const handlePrint = () => {
    window.print();
  };

  // Render header dengan informasi petugas
  const renderHeader = () => {
    return (
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Pesanan</h1>
          <p className="text-gray-600">Daftar laporan pesanan </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={pesanan.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan informasi petugas */}
        {renderHeader()}

        {/* Summary Keseluruhan */}
        {!loading && pesanan.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 print:grid print:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:border print:border-gray-300">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg print:bg-gray-200">
                  <svg className="w-6 h-6 text-blue-600 print:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{totalKeseluruhan.totalPesanan}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:border print:border-gray-300">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg print:bg-gray-200">
                  <svg className="w-6 h-6 text-green-600 print:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalKeseluruhan.totalPendapatan)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:border print:border-gray-300">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg print:bg-gray-200">
                  <svg className="w-6 h-6 text-orange-600 print:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Item Terjual</p>
                  <p className="text-2xl font-bold text-gray-900">{totalKeseluruhan.totalItemTerjual}</p>
                </div>
              </div>
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
          ) : pesanan.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada pesanan</h3>
              <p className="mt-2 text-gray-500">Pesanan yang dilaporkan akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedDates.map((date) => {
                const orders = groupedPesanan[date];
                const stats = dailyStats.find(stat => stat.date === date);

                return (
                  <div key={date} className="p-6 print:p-4">
                    {/* Header Tanggal */}
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 print:text-lg">
                            {formatDateWithDay(date)}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {stats.totalPesanan} pesanan • {stats.totalItemTerjual} item terjual
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium print:bg-gray-200 print:text-gray-800">
                            Pendapatan: {formatCurrency(stats.totalPendapatan)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Daftar Pesanan per Tanggal */}
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer print:p-3 print:border print:border-gray-300"
                          onClick={() => handlePesananClick(order)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center print:bg-gray-200">
                                  <span className="text-green-600 font-medium text-sm print:text-gray-700">
                                    #{order.id}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">
                                    Pesanan #{order.id}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {formatTime(order.created_at)} • {order.petugas?.fullname || order.petugas?.username || 'Petugas'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 sm:mt-0 sm:text-right">
                              <div className="text-lg font-bold text-green-600 print:text-gray-800">
                                {formatCurrency(order.total_harga)}
                              </div>
                              <p className="text-xs text-blue-600 mt-1 print:hidden">
                                Klik untuk detail →
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Detail Pesanan */}
        {showModal && selectedPesanan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 print:hidden">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detail Pesanan #{selectedPesanan.id}</h2>
                  <p className="text-gray-600 mt-1">{formatDateTime(selectedPesanan.created_at)}</p>
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
                {/* Informasi Petugas yang Login */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informasi Petugas</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {getPetugasName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getPetugasName()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Petugas {getPetugasKelas() && `• ${getPetugasKelas()}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informasi Petugas yang Membuat Pesanan (jika berbeda) */}
                {selectedPesanan.petugas && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Petugas Pembuat Pesanan</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">
                          {selectedPesanan.petugas?.fullname?.charAt(0) || selectedPesanan.petugas?.username?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedPesanan.petugas?.fullname || selectedPesanan.petugas?.username || 'Petugas'}
                        </p>
                        <p className="text-sm text-gray-500">Pembuat Pesanan</p>
                      </div>
                    </div>
                  </div>
                )}

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
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:bg-gray-200 {
            background-color: #f3f4f6 !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
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

export default LaporanPesananHarian;