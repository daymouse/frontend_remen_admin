import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { apiFetch } from "./../server";

const AddMemberModal = ({ isOpen, onClose, onSuccess }) => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
    fullname: "",
    no_wa: "",
    kelas: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/manajement-user/add-user", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      if (response.message) {
        onSuccess(response.message);
        setFormData({
          username: "",
          password: "",
          confirm_password: "",
          fullname: "",
          no_wa: "",
          kelas: ""
        });
        onClose();
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menambahkan member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md sm:max-w-lg rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900">
              Tambah Member Baru
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan username"
                />
              </div>

              {/* Fullname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  name="no_wa"
                  value={formData.no_wa}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas *
                </label>
                <input
                  type="text"
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Contoh: X IPA 1"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Konfirmasi password"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#ccc" : primary,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium hover:bg-[#8B4A23]"
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = hoverPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = primary;
                  }
                }}
              >
                {loading ? "Menambahkan..." : "Tambah Member"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddMemberModal;