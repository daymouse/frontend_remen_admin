import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/server";
import AddMemberModal from "@/components/ManajementUser/AddMemberModal";
import { useNavigate } from "react-router-dom";
import TableBahan from "@/components/Bahanbaku/laporanStokPending/Table"
import RejectModal from "@/components/Bahanbaku/laporanStokPending/RejectModal"
import { MoreVertical, UserPlus, CheckCircle, XCircle  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/providers/AlertConfirmProvider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import UpsertBahanBakuModal from "@/components/Bahanbaku/UpsertBahanBakuModal";
import FilterBahanBakuModal from "@/components/Bahanbaku/FilterBahanBakuModal";
import { NavLink } from "react-router-dom"
import { isDate } from "date-fns";

const LaporanRealStok = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const { confirm, alert } = useConfirm()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [petugas, setPetugas] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const perPageOptions = [10, 20, 30, 40, 50]
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectItem, setRejectItem] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  const [perPage, setPerPage] = useState(perPageOptions[0])

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false)

    const [filters, setFilters] = useState({
    tipe: "",
    satuan_tipe: "",
    avg_cost_min: "",
    avg_cost_max: "",
    })

  const fetchData = async () => {
  try {
    setLoading(true)


    const response = await apiFetch("/api/laporan/stok/pending", {
        method: "POST",
        body: JSON.stringify({
            page,
            perPage,
            search: searchValue || "",
            fullname: filters.fullname || "",
            kelas: filters.kelas || "",
            start_date: filters.start_date || null,
            end_date: filters.end_date || null,
        }),
    })

    if (response.data) {
      setData(response.data)
      setTotalPages(response.pagination?.total_page || 1)
      setTotalData(response.pagination?.total_data || 0)
      setPetugas(response.data.petugas)
    }
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  const delay = setTimeout(() => {
    fetchData()
  }, 500)

  return () => clearTimeout(delay)
}, [searchValue])

 useEffect(() => {
  fetchData()
}, [page, perPage, filters])

  useEffect(() => {
    setPage(1)
  }, [perPage, searchValue])


  const handleAddMemberSuccess = (message ) => {
    setSuccessMessage(message);
    fetchData();
  }

    const handleApprove = async (item) => {
        const ok = await confirm(
            `Yakin ingin approve laporan dari ${item.petugas.fullname}?`
        )

        if (!ok) return

        try {
            const response = await apiFetch(
            `/api/stok-adjustment/approve/${item.id}`,
            { method: "POST" }
            )

            await alert(response.message || "Berhasil approve")
            fetchData()

        } catch (err) {
            await alert(err.message || "Gagal approve")
        }
    }
    const handleRejectClick = (item = null) => {
        if (item) {
            // single reject
            setRejectItem(item)
            setSelectedIds([])
        } else {
            // multi reject
            if (selectedIds.length === 0) {
            alert("Pilih minimal 1 data")
            return
            }
            setRejectItem(null)
        }

        setRejectOpen(true)
    }

const handleSubmitReject = async (reason) => {
  let ids = []

  if (rejectItem) {
    ids = [Number(rejectItem.id)]
  } else {
    ids = selectedIds
      .map((id) => Number(id))
      .filter((id) => id > 0)
  }

  if (ids.length === 0) {
    await alert("Batch tidak valid")
    return
  }
  console.log("IDS:", ids)

  try {
    const response = await apiFetch(
      `/api/stok-adjustment/reject`,
      {
        method: "POST",
        body: JSON.stringify({
          batch_ids: ids,
          reason: reason
        }),
      }
    )

    await alert(response.message || "Berhasil reject")

    setRejectOpen(false)
    setRejectItem(null)
    setSelectedIds([])
    fetchData()

  } catch (err) {
    await alert(err.message || "Gagal reject")
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
        fetchData()
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


  const handleEdit = (item) => {
    setSelectedItem(item)
    setOpen(true)
    }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 flex flex-row justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Stok Bahan Baku</h1>
          <p className="text-gray-600 mt-1">Kelola data bahan baku</p>
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

      <TableBahan
        petugas={petugas}
        data={data}
        search={searchValue}
        setSearch={setSearchValue}
        onDelete={confirmDelete}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        totalPages={totalPages}
        totalData={totalData}
        loading={loading}
        onEdit={handleEdit}
        perPageOptions={perPageOptions}
        onApprove={handleApprove}
        onReject={handleRejectClick}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

      <AddMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleAddMemberSuccess}
      />

      <FilterBahanBakuModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        currentFilter={filters}
        onApply={(newFilter) => {
            setFilters(newFilter)
            setPage(1)
            setFilterOpen(false)
        }}
        />
        <RejectModal
            open={rejectOpen}
            onClose={() => setRejectOpen(false)}
            onSubmit={handleSubmitReject}
            item={rejectItem}
        />

    </div>
  );
};

export default LaporanRealStok;