import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/server";
import UserPendingTable from "@/components/UserPandding/UserPendingTable"
import { useConfirm } from "@/components/providers/AlertConfirmProvider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { MoreVertical, UserPlus, CheckCircle, XCircle  } from "lucide-react"

const ManajementUserPendding = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { confirm, alert } = useConfirm()
  const [actionLoading, setActionLoading] = useState(false)
  const inputRef = useRef(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/api/manajement-user/pending");
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

const approval = async (id_petugas, fullname) => {
  const isConfirmed = await confirm(
    `Yakin ingin approve user:\n\n${fullname} ?`
  )

  if (!isConfirmed) return

  try {
    setActionLoading(true)

    const response = await apiFetch(
      `/api/manajement-user/approve/${id_petugas}`,
      { method: "PUT" }
    )

    if (response.message) {
      setSuccessMessage(`User ${fullname} berhasil di-approve`)
      setUsers(prev =>
        prev.filter(user => user.id_petugas !== id_petugas)
      )
    }

  } catch (err) {
    alert(err.message || "Gagal approve user")
  } finally {
    setActionLoading(false)
  }
}

const reject = async (id_petugas, fullname) => {
  const isConfirmed = await confirm(
    `User berikut akan ditolak:\n\n${fullname}\n\nSeluruh data akan dihapus.\nTindakan ini tidak dapat dibatalkan.\n\nLanjutkan?`
  )

  if (!isConfirmed) return

  try {
    setActionLoading(true)

    const response = await apiFetch(
      `/api/manajement-user/reject/${id_petugas}`,
      { method: "PUT" }
    )

    if (response.message) {
      setSuccessMessage(`User ${fullname} berhasil di-reject`)
      setUsers(prev =>
        prev.filter(user => user.id_petugas !== id_petugas)
      )
    }

  } catch (err) {
    alert(err.message || "Gagal reject user")
  } finally {
    setActionLoading(false)
  }
}


useEffect(() => {
  if (!successMessage && !error) return

  const timer = setTimeout(() => {
    setSuccessMessage("")
    setError("")
  }, 3000)

  return () => clearTimeout(timer)
}, [successMessage, error])

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600 mt-1">Data user membutuhkan approval</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Alert className="bg-white shadow-sm">
            <CheckCircle className="h-4 w-4 0" />
            <AlertTitle>Berhasil</AlertTitle>
            <AlertDescription>
              {successMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Alert variant="destructive" className="shadow-sm">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <UserPendingTable
        users={filteredUsers}
        search={searchTerm}
        setSearch={setSearchTerm}
        loading={loading}
        onApprove={approval}
        onReject={reject}
      />
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>

            <span className="text-sm font-medium text-gray-700">
              Memproses data...
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManajementUserPendding;