import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "./../server";

const FilterPesananModal = ({ isOpen, onClose, onApplyFilter, currentFilters }) => {
  const [filters, setFilters] = useState({
    tanggalAwal: "",
    tanggalAkhir: "",
    hargaMin: "",
    hargaMax: "",
    produkId: "",
    userId: ""
  });
  
  const [produk, setProduk] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProduk, setLoadingProduk] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchProduk, setSearchProduk] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [showProdukDropdown, setShowProdukDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  const modalRef = useRef(null);
  const produkDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Initialize filters when modal opens
  useEffect(() => {
    if (isOpen) {
      // Jangan reset filter saat modal dibuka, gunakan currentFilters
      setFilters(currentFilters);
      setErrors({});
      
      // Set search terms berdasarkan currentFilters
      if (currentFilters.produkId) {
        const selectedProduct = produk.find(p => p.id === parseInt(currentFilters.produkId));
        if (selectedProduct) {
          setSearchProduk(selectedProduct.nama_produk || "");
        }
      } else {
        setSearchProduk("");
      }
      
      if (currentFilters.userId) {
        const selectedUser = users.find(u => u.id_petugas === parseInt(currentFilters.userId));
        if (selectedUser) {
          setSearchUser(selectedUser.fullname || selectedUser.username || "");
        }
      } else {
        setSearchUser("");
      }
    }
  }, [isOpen, currentFilters, produk, users]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close produk dropdown
      if (produkDropdownRef.current && !produkDropdownRef.current.contains(event.target)) {
        setShowProdukDropdown(false);
      }
      
      // Close user dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      
      // Close modal when clicking outside
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch produk data
  useEffect(() => {
    const fetchProduk = async () => {
      try {
        setLoadingProduk(true);
        const data = await apiFetch("/api/produk");
        setProduk(data || []);
      } catch (error) {
        console.error("Error fetching produk:", error);
      } finally {
        setLoadingProduk(false);
      }
    };

    if (isOpen) {
      fetchProduk();
    }
  }, [isOpen]);

  // Fetch users data
  // Fetch users data
useEffect(() => {
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiFetch("/api/manajement-user/all");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (isOpen) {
    fetchUsers();
  }
}, [isOpen]);

  // Filter produk based on search
  const filteredProduk = produk.filter(product =>
    product.nama_produk?.toLowerCase().includes(searchProduk.toLowerCase())
  );

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.fullname?.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Validasi form
  const validateForm = () => {
    const newErrors = {};

    // Validasi tanggal
    if (filters.tanggalAwal && filters.tanggalAkhir && filters.tanggalAkhir < filters.tanggalAwal) {
      newErrors.tanggal = "Tanggal akhir tidak boleh sebelum tanggal awal";
    }

    // Validasi harga
    if (filters.hargaMin && filters.hargaMax) {
      const hargaMin = parseInt(filters.hargaMin);
      const hargaMax = parseInt(filters.hargaMax);
      
      if (hargaMin < 0) {
        newErrors.hargaMin = "Harga minimal tidak boleh negatif";
      }
      
      if (hargaMax < 0) {
        newErrors.hargaMax = "Harga maksimal tidak boleh negatif";
      }
      
      if (hargaMax < hargaMin) {
        newErrors.hargaMax = "Harga maksimal tidak boleh kurang dari harga minimal";
      }
    } else if (filters.hargaMin && parseInt(filters.hargaMin) < 0) {
      newErrors.hargaMin = "Harga minimal tidak boleh negatif";
    } else if (filters.hargaMax && parseInt(filters.hargaMax) < 0) {
      newErrors.hargaMax = "Harga maksimal tidak boleh negatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }

    // Clear related errors
    if (field === 'tanggalAwal' || field === 'tanggalAkhir') {
      if (errors.tanggal) {
        setErrors(prev => ({
          ...prev,
          tanggal: ""
        }));
      }
    }
  };

  const handleApplyFilter = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    onApplyFilter(filters);
    onClose();
  };

  const handleResetFilter = () => {
    const resetFilters = {
      tanggalAwal: "",
      tanggalAkhir: "",
      hargaMin: "",
      hargaMax: "",
      produkId: "",
      userId: ""
    };
    setFilters(resetFilters);
    setSearchProduk("");
    setSearchUser("");
    setErrors({});
    onApplyFilter(resetFilters);
  };

  const handleSelectProduk = (product) => {
    setFilters(prev => ({ ...prev, produkId: product.id }));
    setSearchProduk(product.nama_produk);
    setShowProdukDropdown(false);
  };

  const handleSelectUser = (user) => {
    setFilters(prev => ({ ...prev, userId: user.id_petugas })); // UUID string
    setSearchUser(user.fullname || user.username);
    setShowUserDropdown(false);
    };

  const handleClearProduk = () => {
    setFilters(prev => ({ ...prev, produkId: "" }));
    setSearchProduk("");
  };

  const handleClearUser = () => {
    setFilters(prev => ({ ...prev, userId: "" }));
    setSearchUser("");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Filter Pesanan</h2>
            <p className="text-sm text-gray-600 mt-1">Sesuaikan kriteria pencarian</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Date Range Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Rentang Tanggal
              </h3>
              
              {errors.tanggal && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg" data-error="true">
                  <p className="text-red-600 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.tanggal}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Awal
                  </label>
                  <input
                    type="date"
                    value={filters.tanggalAwal}
                    onChange={(e) => handleInputChange('tanggalAwal', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.tanggal ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={filters.tanggalAkhir}
                    onChange={(e) => handleInputChange('tanggalAkhir', e.target.value)}
                    min={filters.tanggalAwal}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.tanggal ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Price Range Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Rentang Harga
              </h3>
              
              {(errors.hargaMin || errors.hargaMax) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg" data-error="true">
                  {errors.hargaMin && (
                    <p className="text-red-600 text-sm flex items-center mb-1">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.hargaMin}
                    </p>
                  )}
                  {errors.hargaMax && (
                    <p className="text-red-600 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.hargaMax}
                    </p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Minimal
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filters.hargaMin}
                      onChange={(e) => handleInputChange('hargaMin', e.target.value)}
                      placeholder="0"
                      min="0"
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.hargaMin ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rp</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Maksimal
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filters.hargaMax}
                      onChange={(e) => handleInputChange('hargaMax', e.target.value)}
                      placeholder="1000000"
                      min={filters.hargaMin || "0"}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.hargaMax ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Filter Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Filter Produk
              </h3>
              
              <div className="relative" ref={produkDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Produk
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchProduk}
                    onChange={(e) => {
                      setSearchProduk(e.target.value);
                      setShowProdukDropdown(true);
                    }}
                    onFocus={() => setShowProdukDropdown(true)}
                    placeholder="Ketik untuk mencari produk..."
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {filters.produkId && (
                    <button
                      onClick={handleClearProduk}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {showProdukDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingProduk ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Memuat produk...</p>
                      </div>
                    ) : filteredProduk.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">Tidak ada produk ditemukan</p>
                      </div>
                    ) : (
                      filteredProduk.map(product => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleSelectProduk(product)}
                        >
                          <div className="font-medium text-gray-900 text-sm">{product.nama_produk}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(product.harga)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* User Filter Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Filter Petugas
              </h3>
              
              <div className="relative" ref={userDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Petugas
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    placeholder="Ketik untuk mencari petugas..."
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {filters.userId && (
                    <button
                      onClick={handleClearUser}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {showUserDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Memuat petugas...</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">Tidak ada petugas ditemukan</p>
                      </div>
                    ) : (
                      filteredUsers.map(user => (
                        <div
                          key={user.id_petugas}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-medium text-xs">
                                {user.fullname?.charAt(0) || user.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {user.fullname || user.username}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Sticky */}
        <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetFilter}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium order-2 sm:order-1"
            >
              Reset Semua
            </button>
            <button
              onClick={handleApplyFilter}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium order-1 sm:order-2"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPesananModal;