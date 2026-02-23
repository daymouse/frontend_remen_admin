import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/server";
import AddMemberModal from "@/components/ManajementUser/AddMemberModal";
import { useNavigate } from "react-router-dom";
import UserTable from "@/components/ManajementUser/UserTable"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, UserPlus, CheckCircle, XCircle  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/providers/AlertConfirmProvider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import debounce from "lodash.debounce"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"



const ManajementUser = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const { confirm, alert } = useConfirm()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)

  const perPageOptions = [10, 20, 30, 40, 50]

  const [perPage, setPerPage] = useState(perPageOptions[0])

  const navigate = useNavigate();


  const inputRef = useRef(null);

  const fetchUsers = async (pageValue, perPageValue, searchValue) => {
    try {
      setLoading(true)

      const response = await apiFetch(
        "/api/manajement-user/all",
        {
          method: "POST",
          body: JSON.stringify({
            page: pageValue,
            perPage: perPageValue,
            search: searchValue
          })
        }
      )

      if (response.data) {
        setUsers(response.data)
        setTotalPages(response.pagination?.total_pages || 1)
        setTotalData(response.pagination?.total_data || 0)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const debouncedFetch = useRef(
    debounce((page, perPage, search) => {
      fetchUsers(page, perPage, search)
    }, 500)
  ).current

  useEffect(() => {
    debouncedFetch(page, perPage, searchTerm)
  }, [page, perPage, searchTerm])

  useEffect(() => {
    setPage(1)
  }, [perPage, searchTerm])


  useEffect(() => {
  return () => {
    debouncedFetch.cancel()
  }
}, [])

  const fetchPendingCount = async () => {
    try {
      const res = await apiFetch("/api/manajement-user/count-pending");
      setPendingCount(res.count || 0);
    } catch (err) {
      console.error("Gagal mengambil pending count");
    }
  };


  useEffect(() => {
    fetchPendingCount();
  }, []);



  const handleAddMemberSuccess = (message ) => {
    setSuccessMessage(message);
    fetchUsers();
  }

  const handleUpdateUser = async (id, data) => {
    try {
      const response = await apiFetch(
        `/api/manajement-user/update/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...data
          })
        }
      )

      if (response.message) {
        setSuccessMessage("Data berhasil diupdate")
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || "Gagal mengupdate data")
    }
  }


  const confirmDelete = async (id_petugas, fullname) => {
    const ok = await confirm(
      `Apakah Anda yakin ingin menghapus user @${fullname}?`
    )

    if (!ok) return

    try {
      setDeletingId(id_petugas)

      const response = await apiFetch(
        `/api/manajement-user/delete/${id_petugas}`,
        { method: "DELETE" }
      )

      if (response.message) {
        await alert("User berhasil dihapus")
        fetchUsers()
      }
    } catch (err) {
      await alert(err.message || "Gagal menghapus user")
    } finally {
      setDeletingId(null)
    }
}

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const formatTimestamp = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    return `${y}${m}${d}_${h}${min}`
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")

    const tableRows = users.map((user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${user.username_admin}</td>
        <td>${user.fullname}</td>
        <td>${user.nickname}</td>
        <td>${user.no_wa}</td>
        <td>${user.kelas}</td>
        <td>${user.email}</td>
      </tr>
    `).join("")

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Data User</title>
          <style>
            table { width:100%; border-collapse: collapse; }
            th, td { border:1px solid #000; padding:6px; font-size:12px; }
          </style>
        </head>
        <body>
          <h3>Data User</h3>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Fullname</th>
                <th>Nickname</th>
                <th>No WA</th>
                <th>Kelas</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }


  const handleExportExcel = () => {
    const formattedData = users.map((user, index) => ({
      No: index + 1,
      Username: user.username_admin,
      Fullname: user.fullname,
      Nickname: user.nickname,
      "No WA": user.no_wa,
      Kelas: user.kelas,
      Email: user.email,
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Petugas")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    })

    const fileName = `data_petugas_${formatTimestamp()}.xlsx`

    saveAs(blob, fileName)
  }

  const handleExportWord = () => {
    const fileName = `data_petugas_${formatTimestamp()}.doc`

    const content = `
      <html>
        <body>
          <h3>Data Petugas</h3>
          <p>Dicetak pada: ${new Date().toLocaleString()}</p>
          <table border="1">
            <tr>
              <th>No</th>
              <th>Username</th>
              <th>Fullname</th>
              <th>Nickname</th>
              <th>No WA</th>
              <th>Kelas</th>
              <th>Email</th>
            </tr>
            ${users.map((user, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${user.username_admin}</td>
                <td>${user.fullname}</td>
                <td>${user.nickname}</td>
                <td>${user.no_wa}</td>
                <td>${user.kelas}</td>
                <td>${user.email}</td>
              </tr>
            `).join("")}
          </table>
        </body>
      </html>
    `

    const blob = new Blob(['\ufeff', content], {
      type: "application/msword"
    })

    saveAs(blob, fileName)
  }


  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 flex flex-row items-center justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600 mt-1">Kelola data member dan petugas</p>
        </div>
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="relative">
                <MoreVertical className="h-5 w-5" />

                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">

              <DropdownMenuItem
                onClick={() => setIsOpen(true)}
                className="cursor-pointer"
              >
                Tambah Petugas
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/dashboard/manajement-user/user-pending")}
                className="flex justify-between cursor-pointer"
              >
                Approve Petugas
                {pendingCount > 0 && (
                  <span className="ml-2 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={handlePrint}>
                    Print
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleExportExcel}>
                    Excel (.xlsx)
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleExportWord}>
                    Word (.docx)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-[#622F10]"
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
            <span className="text-sm font-medium">
              Menghapus & Mengirim Email...
            </span>
          </div>
        </div>
      )}

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

      <UserTable
        users={users}
        search={searchTerm}
        setSearch={setSearchTerm}
        onUpdate={handleUpdateUser}
        onDelete={confirmDelete}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        totalPages={totalPages}
        totalData={totalData}
        loading={loading}
        perPageOptions={perPageOptions}
      />

      <AddMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleAddMemberSuccess}
      />
    </div>
  );
};

export default ManajementUser;