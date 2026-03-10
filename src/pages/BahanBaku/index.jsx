import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/server";
import AddMemberModal from "@/components/ManajementUser/AddMemberModal";
import { useNavigate } from "react-router-dom";
import TableBahan from "@/components/Bahanbaku/Table"
import InventorySummary from "@/components/Bahanbaku/SummaryCard"
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
import UpsertBahanBakuModal from "@/components/Bahanbaku/UpsertBahanBakuModal";
import FilterBahanBakuModal from "@/components/Bahanbaku/FilterBahanBakuModal";
import { NavLink } from "react-router-dom"
import ActiveFilters from "@/components/Bahanbaku/ActiveFilters"

const BahanBaku = () => {
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
  const [searchValue, setSearchValue] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [hasPending, setHasPending] = useState(false);
  const perPageOptions = [10, 20, 30, 40, 50]
  const [perPage, setPerPage] = useState(perPageOptions[0])
    const [summary, setSummary] = useState({
    total_inventory_value_sistem: 0,
    total_inventory_value_real: 0,
    total_bahan: 0,
    last_sync: null,
  })
  const [summaryLoading, setSummaryLoading] = useState(true)
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false)

  const [filters, setFilters] = useState({
    tipe: "",
    satuan_tipe: "",
    avg_cost_min: "",
    avg_cost_max: "",
    start_date: "",
    end_date: "",
    low_stock: false,
  })

  const fetchData = async () => {
  try {
    setLoading(true)

    const response = await apiFetch("/auth/bahan-baku-list", {
      method: "POST",
      body: JSON.stringify({
      page,
      perPage,
      search: searchValue,

      tipe: filters.tipe || null,
      satuan_tipe: filters.satuan_tipe || null,

      avg_cost_min: filters.avg_cost_min || null,
      avg_cost_max: filters.avg_cost_max || null,

      start_date: filters.start_date || null,
      end_date: filters.end_date || null,
      low_stock: filters.low_stock ?? null,
    })
    })

    if (response.data) {
      setData(response.data)
      setTotalPages(response.pagination?.total_page || 1)
      setTotalData(response.pagination?.total_data || 0)
    }
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

const fetchPending = async () => {
  try {
    const res = await apiFetch("/api/laporan/stok/haspending");
    setHasPending(!!res.has_pending);
  } catch (err) {
    console.error("Gagal mengambil pending count", err);
  }
};

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)

      const response = await apiFetch("/auth/inventory/summery", {
        method: "GET",
      })

      if (response.status === "success") {
        setSummary(response.data)
      }
    } catch (err) {
      console.error("Gagal mengambil inventory summary", err)
    } finally {
      setSummaryLoading(false)
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
    fetchPending()
    fetchSummary()
  }, [page, perPage, filters])

  useEffect(() => {
    setPage(1)
  }, [perPage, searchValue])


  const handleAddMemberSuccess = (message ) => {
    setSuccessMessage(message);
    fetchData();
  }



  const confirmDelete = async (id, nama) => {
    const ok = await confirm(
      `Apakah Anda yakin ingin menonaktifkan bahan "${nama}"?`
    )

    if (!ok) return

    try {
      setDeletingId(id)

      const response = await apiFetch("/api/bahan-baku-delete", {
        method: "POST",
        body: JSON.stringify({
          id: id,
        }),
      })

      if (response.success) {
        await alert(response.message || "Bahan baku berhasil hapus")
        fetchData()
        fetchSummary()
      } else {
        await alert(response.message || "Gagal menghapus bahan")
      }
    } catch (err) {
      await alert(err.message || "Terjadi kesalahan server")
    } finally {
      setDeletingId(null)
    }
  }

  const handlePushStock = async (ids = []) => {
    try {
      const ok = await confirm(
        ids.length > 1
          ? `Push sinkronisasi ${ids.length} bahan?`
          : "Push sinkronisasi stok bahan ini?"
      )

      if (!ok) return

      const response = await apiFetch("/api/stok/push-stok", {
        method: "POST",
        body: JSON.stringify({
          bahan_ids: ids,
        }),
      })

      if (!response.success) {
        alert(response.message || "Gagal push stok")
        return
      }

      await alert(
        `Berhasil push ${response.pushed.length} bahan\n` +
        `Skipped ${response.skipped.length} bahan`
      )

      fetchData()
      fetchPending()
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan saat push stok")
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


    const handleSave = async (id, formData) => {
  try {
    let response

    if (id) {
      response = await apiFetch("/auth/bahan-baku-update", {
        method: "POST",
        body: JSON.stringify({
          id,
          nama: formData.nama,
          satuan_id: formData.satuan_id,
          tipe: formData.tipe,
          minimal_stok: Number(formData.minimal_stok || 0),
        }),
      })
    } else {
      response = await apiFetch("/auth/bahan-baku-create", {
        method: "POST",
        body: JSON.stringify({
          nama: formData.nama,
          satuan_id: formData.satuan_id,
          tipe: formData.tipe,
          minimal_stok: Number(formData.minimal_stok || 0),
        }),
      })
    }

    if (!response.success) {
      alert(response.message)
      return
    }

    setSuccessMessage(response.message || "Berhasil menyimpan data")
    setOpen(false)
    fetchData()
  } catch (error) {
    console.error(error)
    alert("Terjadi kesalahan server")
  }
}

  const handleEdit = (item) => {
    setSelectedItem(item)
    setOpen(true)
    }

  const formatTimestamp = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    return `${y}${m}${d}_${h}${min}`
  }

    const hitungSelisihPersen = (stokSistem, stokReal) => {
    const sistem = Number(stokSistem)
    const real = Number(stokReal)

    if (isNaN(sistem) || isNaN(real)) return 0
    if (sistem === 0 && real === 0) return 0
    if (sistem === 0) return 100

    const selisih = real - sistem
    const persen = (selisih / sistem) * 100

    return Number(persen.toFixed(2))
  }

    const handlePrint = () => {
    const printWindow = window.open("", "_blank")

    const tableRows = data.map((item, index) => `
        <tr>
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>${item.tipe}</td>
        <td>${formatNumber(item.stok_sistem)} ${item.satuan_kode}</td>
        <td>${formatNumber(item.stok_real)} ${item.satuan_kode}</td>
        <td>${hitungSelisihPersen(item.stok_sistem, item.stok_real)}%</td>
        <td>${formatNumber(item.minimal_stok)} ${item.satuan_kode}</td>
        <td>${formatRupiah(item.avg_cost)}</td>
        <td>${item.satuan_tipe}</td>
        </tr>
    `).join("")

    printWindow.document.write(`
        <html>
        <head>
            <title>Print Data Bahan Baku</title>
            <style>
            body { font-family: Arial; }
            table { width:100%; border-collapse: collapse; margin-top:10px; }
            th, td { border:1px solid #000; padding:6px; font-size:12px; text-align:left; }
            th { background:#f3f3f3; }
            </style>
        </head>
        <body>
            <h3>Data Bahan Baku</h3>
            <p>Dicetak pada: ${new Date().toLocaleString()}</p>
            <table>
            <thead>
                <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Stok Sistem</th>
                <th>Stok Real</th>
                <th>Selisih</th>
                <th>Minimal Stok</th>
                <th>Avg Cost</th>
                <th>Satuan</th>
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
  const formattedData = data.map((item, index) => ({
    No: index + 1,
    Nama: item.nama,
    Tipe: item.tipe,
    "Stok Sistem": `${formatNumber(item.stok_sistem)} ${item.satuan_kode}`,
    "Stok Real":`${formatNumber(item.stok_real)} ${item.satuan_kode}`,
    "Selisih":`${hitungSelisihPersen(item.stok_sistem, item.stok_real)}%`,
    "Minimal Stok": `${formatNumber(item.minimal_stok)} ${item.satuan_kode}`,
    "Avg Cost": formatRupiah(item.avg_cost),
    "Satuan Tipe": item.satuan_tipe,
  }))

  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Bahan Baku")

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  })

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  })

  const fileName = `data_bahan_baku_${formatTimestamp()}.xlsx`

  saveAs(blob, fileName)
}

  const formatNumber = (value) => {
  if (!value) return "0"

  const number = parseFloat(value)
  if (number % 1 === 0) {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(number)
  }
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(number)
}
  function formatRupiah(value) {
    if (value == null) return "Rp 0"
    return `Rp ${Number(value).toLocaleString("id-ID")}`
    }

const handleExportWord = () => {
  const fileName = `data_bahan_baku_${formatTimestamp()}.doc`

  const content = `
    <html>
      <body>
        <h3>Data Bahan Baku</h3>
        <p>Dicetak pada: ${new Date().toLocaleString()}</p>
        <table border="1" style="border-collapse:collapse; width:100%;">
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Stok Sistem</th>
            <th>Stok Real</th>
            <th>Selisih</th>
            <th>Minimal Stok</th>
            <th>Avg Cost</th>
            <th>Satuan</th>
          </tr>
          ${data.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.nama}</td>
              <td>${item.tipe}</td>
              <td>${formatNumber(item.stok_sistem)} ${item.satuan_kode}</td>
              <td>${formatNumber(item.stok_real)} ${item.satuan_kode}</td>
              <td>${hitungSelisihPersen(item.stok_sistem, item.stok_real)}%</td>
              <td>${formatNumber(item.minimal_stok)} ${item.satuan_kode}</td>
              <td>${formatRupiah(item.avg_cost)}</td>
              <td>${item.satuan_tipe}</td>
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
      <div className="mb-6 flex flex-row justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Stok Bahan Baku</h1>
          <p className="text-gray-600 mt-1">Kelola data bahan baku</p>
        </div>
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="relative" variant="outline">
                <MoreVertical className="h-5 w-5" />

                {hasPending && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => {
                    setSelectedItem(null)
                    setOpen(true)
                }}
                className="cursor-pointer"
              >
                Tambah Bahan
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/dashboard/stok-adjustment"
                  className={({ isActive }) =>
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  Laporan Stok
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/dashboard/stok-pending"
                  className={({ isActive }) =>
                    `flex items-center justify-between ${
                      isActive
                        ? "font-semibold text-primary"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <>
                    <span>Laporan stok pending</span>

                    {hasPending && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterOpen(true)}
                >
                Filter
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

      <InventorySummary 
        data={summary}
        loading={summaryLoading}
      />
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
              loading
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
      <ActiveFilters
        filter={filters}
        onClear={() => {
          setFilters({
            tipe: "",
            satuan_tipe: "",
            avg_cost_min: "",
            avg_cost_max: "",
            start_date: "",
            end_date: "",
            low_stock: false,
          })
          setPage(1)
        }}
      />

      <TableBahan
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
        onPushStock={handlePushStock}
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

      <UpsertBahanBakuModal
        open={open}
        onClose={() => setOpen(false)}
        item={selectedItem}
        onSave={handleSave}
      />
    </div>
  );
};

export default BahanBaku;