import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/server";
import AddMemberModal from "@/components/ManajementUser/AddMemberModal";
import { useNavigate } from "react-router-dom";
import TableBahan from "@/components/Bahanbaku/laporanStokPending/detail/Table"
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
import RejectModal from "@/components/Bahanbaku/laporanStokPending/RejectModal"
import FilterBahanBakuModal from "@/components/Bahanbaku/FilterBahanBakuModal";
import { useParams } from "react-router-dom"

const DetailLaporanRealStok = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const { id } = useParams()
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
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectItem, setRejectItem] = useState(null)
  const perPageOptions = [10, 20, 30, 40, 50]

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

    const response = await apiFetch(`/api/laporan/stok/pending/${id}`, {
      method: "POST",
      body: JSON.stringify({
        page,
        perPage,
        search: searchValue,
        tipe: filters.tipe || null,
        satuan_tipe: filters.satuan_tipe || null,
        avg_cost_min: filters.avg_cost_min || null,
        avg_cost_max: filters.avg_cost_max || null,
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


    const handleApprove = async () => {
        const ok = await confirm(
            "Yakin ingin approve laporan ini?"
        )

        if (!ok) return

        try {
            const response = await apiFetch(
            `/api/stok-adjustment/approve/${id}`,
            { method: "POST" }
            )

            await alert(response.message || "Berhasil approve")
            navigate("/dashboard/stok-pending")

        } catch (err) {
            await alert(err.message || "Gagal approve")
    }
    }
    const handleRejectClick = (item) => {
        setRejectItem(item)
        setRejectOpen(true)
    }

    const handleSubmitReject = async (reason) => {
        try {
            const response = await apiFetch(
            `/api/stok-adjustment/reject`,
            {
                method: "POST",
                body: JSON.stringify({
                batch_ids: [id],
                reason: reason,
                }),
            }
            )

            await alert(response.message || "Berhasil reject")
            setRejectOpen(false)
            navigate("/dashboard/stok-pending")

        } catch (err) {
            await alert(err.message || "Gagal reject")
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
      <div className="mb-6 flex flex-row items-center justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Stok Bahan Baku</h1>
          <p className="text-gray-600 mt-1">Kelola data bahan baku</p>
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

      <TableBahan
        petugas={petugas}
        data={data}
        search={searchValue}
        setSearch={setSearchValue}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        totalPages={totalPages}
        totalData={totalData}
        loading={loading}
        perPageOptions={perPageOptions}
        onApprove={handleApprove}
        onReject={() => setRejectOpen(true)}
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

export default DetailLaporanRealStok;