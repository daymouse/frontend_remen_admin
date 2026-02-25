import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../server";
import { useNavigate } from "react-router-dom";
import ButtonOutline from "@/components/kasir/ButtonOutline";
import InvoiceModal from "@/components/kasir/InvoiceModal"
import StockWarningModal from "@/components/kasir/StockWarningModal"

const Kasir = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [absenLoading, setAbsenLoading] = useState(false);
  const [sudahJaga, setSudahJaga] = useState(false);
  const [warnings, setWarnings] = useState([])
  const [showWarningModal, setShowWarningModal] = useState(false)

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      
      const response = await apiFetch("/auth/me-petugas", {
        method: "GET",
      });
      
      setUserData(response.user);
      setSudahJaga(response.user.jaga === true);

    } catch (err) {
      console.error("❌ Error fetching user data:", err);
      setError("Gagal memuat data pengguna: " + err.message);
      
      // Redirect ke login jika tidak terautentikasi
      if (err.message.includes("401") || err.message.includes("Not authenticated")) {
        console.log("🔐 Redirecting to login...");
        navigate("/login");
      }
    } finally {
      setUserLoading(false);
      console.log("🏁 User loading finished, userData:", userData);
    }
  };
  const handleJagaHariIni = async () => {
    if (sudahJaga) return;
  
    try {
      setAbsenLoading(true);
  
      const response = await apiFetch("/api/absensi", {
        method: "POST",
      });
  
      if (
        response.status === "checked_in" ||
        response.status === "already_checked_in"
      ) {
        setSudahJaga(true);
  
        // update userData biar konsisten
        setUserData((prev) => ({
          ...prev,
          jaga: true,
          check_in: new Date().toISOString(),
        }));
      }
  
    } catch (err) {
      console.error("❌ Gagal absen:", err);
      alert("Gagal mencatat absensi: " + err.message);
    } finally {
      setAbsenLoading(false);
    }
  };
  

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/api/produk");
      setProducts(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 Component mounted, fetching data...");
    fetchUserData();
    fetchProducts();
  }, []);

  // Debug ketika userData berubah
  useEffect(() => {
    console.log("🔄 userData updated:", userData);
  }, [userData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter produk berdasarkan pencarian
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || product.status === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Search functionality
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchDropdown(value.length > 0);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length > 0) {
      setShowSearchDropdown(true);
    }
  };

  const handleProductSelect = (product) => {
    addToCart(product);
    setSearchTerm("");
    setShowSearchDropdown(false);
  };

  // Tambah produk ke keranjang
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1,
        finalPrice: product.id_diskon ? product.harga_akhir : product.harga
      }]);
    }
  };

  // Update quantity item di keranjang
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Hapus item dari keranjang
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Hitung total
  const subtotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  const total = subtotal;

  // Reset transaksi
  const resetTransaction = () => {
    setCart([]);
  };

  // Format data untuk dikirim ke API
  const formatOrderData = () => {
    return cart.map(item => ({
      id_produk: item.id,
      jumlah: item.quantity,
      harga_satuan: item.finalPrice
    }));
  };

  // Proses lapor pesanan
  const processOrder = async () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!")
      return
    }

    try {
      setSubmitting(true)

      const orderData = {
        items: formatOrderData(),
      }

      const response = await apiFetch("/api/pesanan", {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      if (response.message) {
        const orderPayload = {
          pesanan_id: response.pesanan_id,
          items: [...cart],
          total: total,
          timestamp: new Date().toLocaleString("id-ID"),
        }

        setCurrentOrder(orderPayload)
        if (response.warnings && response.warnings.length > 0) {
          setWarnings(response.warnings)
          setShowWarningModal(true)
        } else {
          setShowInvoiceModal(true)
        }

        resetTransaction()
      }
    } catch (err) {
      alert(`Gagal melaporkan pesanan: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Print invoice
  const printInvoice = () => {
    const invoiceContent = document.getElementById('invoice-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Pesanan - ${currentOrder.pesanan_id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { text-align: center; margin-bottom: 20px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .invoice-table th { background-color: #f5f5f5; }
            .invoice-total { text-align: right; font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          ${invoiceContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setCurrentOrder(null);
  };

  // Logout functionality
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await apiFetch("/auth/logout", {
        method: "POST"
      });
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get display price
  const getDisplayPrice = (product) => {
    return product.id_diskon ? product.harga_akhir : product.harga;
  };

  // Check if product has discount
  const hasDiscount = (product) => {
    return product.id_diskon !== null;
  };

  // Function untuk mendapatkan username dengan fallback yang lebih baik
  const getUsername = () => {
    console.log("👤 Getting username, userData:", userData);
    
    if (!userData) {
      return "Petugas";
    }
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

  // Function untuk mendapatkan info user
  const getUserInfo = () => {
    if (!userData) return null;
    
    return {
      name: getUsername(),
      username: userData.username || userData.user?.username,
      kelas: userData.kelas || userData.user?.kelas,
      isAdmin: userData.is_admin || false
    };
  };

  // Function untuk menampilkan greeting
  const renderUserGreeting = () => {
    if (userLoading) {
      return (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Loading user...
        </span>
      );
    }

    if (!userData) {
      return "Hello, Petugas! 👋";
    }

    const userInfo = getUserInfo();
    return (
      <span>
        Hello, <strong>{userInfo.name}</strong>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{renderUserGreeting()}</h1>
            <p className="text-gray-600"></p>
          </div>
        </div>
        <ButtonOutline
          onClick={handleJagaHariIni}
          sudahJaga={sudahJaga}
          absenLoading={absenLoading}
          primary={primary}
        />
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Products */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative" ref={searchRef}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg 
                      className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {showSearchDropdown && filteredProducts.length > 0 && isMobile && (
                    <div 
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto mt-1"
                    >
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleProductSelect(product)}
                        >
                          {product.gambar && (
                            <img 
                              src={product.gambar} 
                              alt={product.nama_produk}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {product.nama_produk}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-green-600 font-semibold text-sm">
                                {formatCurrency(getDisplayPrice(product))}
                              </div>
                              {hasDiscount(product) && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatCurrency(product.harga)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            style={{ backgroundColor: primary }}
                            className="px-3 py-1 text-white rounded text-sm hover:bg-[#8B4A23] transition-colors flex-shrink-0"
                          >
                            Tambah
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isMobile && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    💡 Gunakan search di atas untuk mencari dan menambahkan produk
                  </p>
                </div>
              )}
            </div>

            {/* Products Grid - Only show on tablet and desktop */}
            {!isMobile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Produk</h2>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    {error}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "Tidak ada produk yang ditemukan" : "Tidak ada produk tersedia"}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          {product.gambar && (
                            <img 
                              src={product.gambar} 
                              alt={product.nama_produk}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm truncate">
                              {product.nama_produk}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded ${
                                product.status === 'aktif' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.status}
                              </span>
                              {product.is_best_seller && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {hasDiscount(product) ? (
                              <>
                                <span className="text-lg font-semibold text-green-600">
                                  {formatCurrency(getDisplayPrice(product))}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatCurrency(product.harga)}
                                </span>
                                <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                  Diskon
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-semibold text-green-600">
                                {formatCurrency(getDisplayPrice(product))}
                              </span>
                            )}
                          </div>
                          
                          {product.peringkat_populer > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span>⭐ {product.peringkat_populer}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            style={{ backgroundColor: primary }}
                            className="px-3 py-1 text-white rounded text-sm hover:bg-[#8B4A23] transition-colors"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Cart & Order */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Keranjang</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                  {cart.length} items
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2">Keranjang masih kosong</p>
                  {isMobile && (
                    <p className="text-sm text-gray-400 mt-1">
                      Gunakan search untuk menambahkan produk
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        {item.gambar && (
                          <img 
                            src={item.gambar} 
                            alt={item.nama_produk}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {item.nama_produk}
                          </h3>
                          <p className="text-green-600 font-semibold text-sm">
                            {formatCurrency(item.finalPrice)}
                          </p>
                          {hasDiscount(item) && (
                            <p className="text-xs text-gray-500 line-through">
                              {formatCurrency(item.harga)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cart.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Ringkasan Pesanan</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetTransaction}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                  <button
                    onClick={processOrder}
                    disabled={submitting}
                    style={{ backgroundColor: submitting ? "#ccc" : primary }}
                    className="flex-1 px-4 py-3 text-white rounded-lg hover:bg-[#8B4A23] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Memproses..." : "Lapor Pesanan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <StockWarningModal
        open={showWarningModal}
        warnings={warnings}
        onContinue={() => {
          setShowWarningModal(false)
          setShowInvoiceModal(true)
        }}
      />

      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={currentOrder}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Kasir;