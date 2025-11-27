import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "./../server";
import AddMemberModal from "./../components/AddMemberModal";

const ManajementUser = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const inputRef = useRef(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/api/manajement-user/all");
      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (err) {
      setError(err.message || "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.no_wa?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleAddMemberSuccess = (message) => {
    setSuccessMessage(message);
    fetchUsers();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Edit functionality
  const startEditing = (id_petugas, field, value) => {
    setEditingId(id_petugas);
    setEditingField(field);
    setEditValue(value || "");
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  // Auto save when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        if (editingId && editingField) {
          saveEdit();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingId, editingField, editValue]);

  // Auto save when pressing Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEdit();
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editingField) return;

    try {
      const userToUpdate = users.find(user => user.id_petugas === editingId);
      if (!userToUpdate) return;

      const updatedData = {
        fullname: userToUpdate.fullname,
        username: userToUpdate.username,
        no_wa: userToUpdate.no_wa,
        kelas: userToUpdate.kelas,
        [editingField]: editValue
      };

      const response = await apiFetch(`/api/manajement-user/update/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData)
      });

      if (response.message) {
        setSuccessMessage("Data berhasil diupdate");
        setEditingId(null);
        setEditingField("");
        setEditValue("");
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Gagal mengupdate data");
      setEditingId(null);
      setEditingField("");
      setEditValue("");
    }
  };

  // Delete functionality
  const confirmDelete = (id_petugas, username) => {
    setDeleteConfirm({ id_petugas, username });
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const deleteUser = async (id_petugas) => {
    try {
      const response = await apiFetch(`/api/manajement-user/delete/${id_petugas}`, {
        method: "DELETE"
      });

      if (response.message) {
        setSuccessMessage("User berhasil dihapus");
        setDeleteConfirm(null);
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Gagal menghapus user");
    }
  };

  // Format date to local string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Render editable field
  const renderEditableField = (user, field, value, displayValue, placeholder = "") => {
    const isEditing = editingId === user.id_petugas && editingField === field;

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleEditChange}
          onKeyPress={handleKeyPress}
          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          placeholder={placeholder}
          autoFocus
        />
      );
    }

    return (
      <div
        onClick={() => startEditing(user.id_petugas, field, value)}
        className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors"
        title="Klik untuk mengedit"
      >
        {displayValue || '-'}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600 mt-1">Kelola data member dan petugas</p>
        </div>
        
        {/* Search and Add Button Container */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari user berdasarkan nama, username, kelas, atau nomor WA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>
          
          {/* Add Member Button */}
          <button
            onClick={() => setIsOpen(true)}
            style={{ backgroundColor: primary }}
            className="sm:w-auto px-6 py-3 text-white rounded-lg transition-colors font-medium hover:bg-[#8B4A23] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Member
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          // Loading State
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          // Empty State
          <div className="text-center py-12 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-4 text-base font-medium text-gray-900">
              {searchTerm ? "User tidak ditemukan" : "Tidak ada data user"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Coba dengan kata kunci lain" : "Mulai dengan menambahkan member baru."}
            </p>
          </div>
        ) : (
          // Users List - Mobile First Design
          <div className="divide-y divide-gray-200">
            {/* Header for larger screens */}
            <div className="hidden sm:grid sm:grid-cols-5 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>User</div>
              <div>Kontak</div>
              <div>Kelas</div>
              <div>Dibuat</div>
              <div>Aksi</div>
            </div>

            {/* Users List */}
            {filteredUsers.map((user) => (
              <div key={user.id_petugas} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.fullname?.charAt(0) || user.username?.charAt(0)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {renderEditableField(user, "fullname", user.fullname, user.fullname, "Nama lengkap")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {renderEditableField(user, "username", user.username, `@${user.username}`, "Username")}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-20">
                      {renderEditableField(user, "kelas", user.kelas, user.kelas, "Kelas")}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">Kontak:</span>
                      {renderEditableField(user, "no_wa", user.no_wa, user.no_wa, "Nomor WA")}
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Dibuat:</span>
                      <div className="text-gray-900">
                        {user.created_at ? formatDate(user.created_at) : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button Mobile */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => confirmDelete(user.id_petugas, user.username)}
                      className="px-4 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-5 items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.fullname?.charAt(0) || user.username?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {renderEditableField(user, "username", user.username, user.username, "Username")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {renderEditableField(user, "fullname", user.fullname, user.fullname, "Nama lengkap")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {renderEditableField(user, "no_wa", user.no_wa, user.no_wa, "Nomor WA")}
                  </div>
                  
                  <div>
                    <span className="inline-flex">
                      {renderEditableField(user, "kelas", user.kelas, user.kelas, "Kelas")}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {user.created_at ? formatDate(user.created_at) : '-'}
                  </div>

                  {/* Delete Button Desktop */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDelete(user.id_petugas, user.username)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Count */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-medium">{filteredUsers.length}</span> dari <span className="font-medium">{users.length}</span> user
              {searchTerm && (
                <span className="text-gray-400"> • Pencarian: "{searchTerm}"</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              💡 Klik pada teks untuk mengedit, tekan Enter atau klik di luar untuk menyimpan
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus user <strong>@{deleteConfirm.username}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm.id_petugas)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleAddMemberSuccess}
      />
    </div>
  );
};

export default ManajementUser;