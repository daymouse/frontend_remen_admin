// components/ModalProfil.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, User, Mail, Phone, BookOpen, Calendar, LogOut, Edit, Lock, ArrowLeft, Check, X as XIcon } from "lucide-react";
import { apiFetch } from "./../server";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ModalProfil = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordVerification, setShowPasswordVerification] = useState(false);
  const navigate = useNavigate();
  
  // State untuk edit inline
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    no_wa: "",
    kelas: "",
    passwordLama: "",
    password: "",
  });
  
  const [verificationPassword, setVerificationPassword] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // Ref untuk input inline
  const inputRef = useRef(null);

  // Fetch user data ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchUserData();
      // Reset semua state ketika modal dibuka
      setShowEditModal(false);
      setShowPasswordVerification(false);
      setVerificationPassword("");
      setError("");
      setVerificationError("");
      setEditingField(null);
    }
  }, [isOpen]);

  // Focus input ketika mode edit aktif
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await apiFetch("/auth/me-petugas", {
        method: "GET",
      });
      
      if (response && response.user) {
        setUserData(response.user);
        setForm({
          username: response.user.username || "",
          fullname: response.user.fullname || "",
          no_wa: response.user.no_wa || "",
          kelas: response.user.kelas || "",
          passwordLama: "",
          password: "",
        });
      } else {
        throw new Error("Struktur data user tidak valid");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi logout
  const handleLogout = async () => {
    if (!confirm("Apakah yakin ingin logout?")) return;
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error logging out:", err);
      // Tetap redirect meskipun ada error
      navigate("/");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Fungsi untuk memulai edit inline
  const startEditInline = (field, value) => {
    setEditingField(field);
    setEditValue(value || "");
    setError("");
  };

  // Fungsi untuk membatalkan edit inline
  const cancelEditInline = () => {
    setEditingField(null);
    setEditValue("");
    setError("");
  };

  // Fungsi untuk menyimpan edit inline
  const saveEditInline = async () => {
    if (!editingField || !userData) return;

    // Validasi
    if (editValue.trim() === "") {
      setError(`Field ${getFieldLabel(editingField)} tidak boleh kosong`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        id_petugas: userData.id_petugas,
        id_user_admin: userData.id_user_admin,
        username: editingField === 'username' ? editValue : userData.username,
        fullname: editingField === 'fullname' ? editValue : userData.fullname,
        no_wa: editingField === 'no_wa' ? editValue : userData.no_wa,
        kelas: editingField === 'kelas' ? editValue : userData.kelas,
      };

      const response = await apiFetch("/api/petugas/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response.message) {
        // Update data lokal
        setUserData(prev => ({
          ...prev,
          [editingField]: editValue
        }));
        
        setForm(prev => ({
          ...prev,
          [editingField]: editValue
        }));

        setEditingField(null);
        setEditValue("");
      } else {
        throw new Error("Gagal memperbarui profil");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  // Handler untuk klik di luar area edit
  const handleClickOutside = (e) => {
    if (editingField && inputRef.current && !inputRef.current.contains(e.target)) {
      saveEditInline();
    }
  };

  // Handler untuk key press di input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEditInline();
    } else if (e.key === 'Escape') {
      cancelEditInline();
    }
  };

  // Helper function untuk mendapatkan label field
  const getFieldLabel = (field) => {
    const labels = {
      username: 'Username',
      fullname: 'Nama Lengkap',
      no_wa: 'No. WhatsApp',
      kelas: 'Kelas'
    };
    return labels[field] || field;
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
      handleCloseAllModals();
    }
  };

  // Tutup semua modal
  const handleCloseAllModals = () => {
    setShowEditModal(false);
    setShowPasswordVerification(false);
    setError("");
    setVerificationError("");
    setVerificationPassword("");
    setEditingField(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profil Petugas</h2>
                <p className="text-gray-600 text-sm mt-1">Klik teks untuk mengedit</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  handleCloseAllModals();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6" onClick={handleClickOutside}>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#622F10]"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={fetchUserData}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              ) : userData ? (
                <div className="space-y-6">
                  {/* Avatar & Nama */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#F7EFEA] rounded-full flex items-center justify-center mb-4 border-4 border-[#622F10]/10">
                      <User size={32} className="text-[#622F10]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {userData.fullname || userData.username || 'Petugas'}
                    </h3>
                    <p className="text-gray-500 mt-1">Petugas</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Informasi Detail */}
                  <div className="space-y-4">
                    {/* Username */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User size={16} className="text-[#622F10]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Username</p>
                        {editingField === 'username' ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="flex-1 px-2 py-1 border border-[#622F10] rounded focus:outline-none focus:ring-1 focus:ring-[#622F10]"
                              disabled={saving}
                            />
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#622F10]"></div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={saveEditInline}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={cancelEditInline}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <XIcon size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p 
                            className="font-medium text-gray-900 cursor-pointer hover:bg-white hover:px-2 hover:py-1 hover:rounded transition-colors"
                            onClick={() => startEditInline('username', userData.username)}
                          >
                            {userData.username || '-'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fullname */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User size={16} className="text-[#622F10]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Nama Lengkap</p>
                        {editingField === 'fullname' ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="flex-1 px-2 py-1 border border-[#622F10] rounded focus:outline-none focus:ring-1 focus:ring-[#622F10]"
                              disabled={saving}
                            />
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#622F10]"></div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={saveEditInline}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={cancelEditInline}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <XIcon size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p 
                            className="font-medium text-gray-900 cursor-pointer hover:bg-white hover:px-2 hover:py-1 hover:rounded transition-colors"
                            onClick={() => startEditInline('fullname', userData.fullname)}
                          >
                            {userData.fullname || '-'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* No WhatsApp */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Phone size={16} className="text-[#622F10]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">No. WhatsApp</p>
                        {editingField === 'no_wa' ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="flex-1 px-2 py-1 border border-[#622F10] rounded focus:outline-none focus:ring-1 focus:ring-[#622F10]"
                              disabled={saving}
                            />
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#622F10]"></div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={saveEditInline}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={cancelEditInline}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <XIcon size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p 
                            className="font-medium text-gray-900 cursor-pointer hover:bg-white hover:px-2 hover:py-1 hover:rounded transition-colors"
                            onClick={() => startEditInline('no_wa', userData.no_wa)}
                          >
                            {userData.no_wa || '-'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Kelas */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <BookOpen size={16} className="text-[#622F10]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kelas</p>
                        {editingField === 'kelas' ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="flex-1 px-2 py-1 border border-[#622F10] rounded focus:outline-none focus:ring-1 focus:ring-[#622F10]"
                              disabled={saving}
                            />
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#622F10]"></div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={saveEditInline}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={cancelEditInline}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <XIcon size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p 
                            className="font-medium text-gray-900 cursor-pointer hover:bg-white hover:px-2 hover:py-1 hover:rounded transition-colors"
                            onClick={() => startEditInline('kelas', userData.kelas)}
                          >
                            {userData.kelas || '-'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tanggal Bergabung */}
                    {userData.created_at && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Calendar size={16} className="text-[#622F10]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Bergabung Sejak</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(userData.created_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ID Petugas */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User size={16} className="text-[#622F10]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">ID Petugas</p>
                        <p className="font-medium text-gray-900 text-xs font-mono">
                          {userData.id_petugas || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 font-medium"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Data tidak tersedia
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalProfil;