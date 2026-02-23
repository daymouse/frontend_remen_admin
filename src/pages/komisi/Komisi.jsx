import { useEffect, useRef, useState } from "react"
import { NavLink  } from "react-router-dom"
import { apiFetch } from "@/server"
import FilterModal from "@/components/komisi/FilterModal"
import { Button } from "@/components/ui/button"
import KomisiModal from "@/components/komisi/SettingModal.jsx"
import KomisiTable from "@/components/komisi/TabelKomisi.jsx"
import AddBonusModal from "@/components/komisi/AddBonus.jsx"
import { useConfirm } from "@/components/providers/AlertConfirmProvider"
import ActionMenu from "@/components/komisi/ActionMenu"
import { Calendar } from "@/components/ui/calendar"
import ActiveFilters from "@/components/komisi/ActiveFilters";
import SummaryBulananCard from "@/components/komisi/SummaryBulananCard"
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "docx"
import { saveAs } from "file-saver"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function Komisi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openFilter, setOpenFilter] = useState(false)
  const [filter, setFilter] = useState(null)
  const [openKomisi, setOpenKomisi] = useState(false)
  const [komisi, setKomisi] = useState(null)
  const printAreaRef = useRef(null)
  const [loadingCairkan, setLoadingCairkan] = useState(false)
  const [selectedIds, setSelectedIds] = useState([]);
  const [openBonus, setOpenBonus] = useState(false)
  const { confirm, alert } = useConfirm()
  const [periodeAkhir, setPeriodeAkhir] = useState(new Date())
  const [summary, setSummary] = useState(null)
  const [page, setPage] = useState(1)
  const [periode, setPeriode] = useState(null)
  const [perPage, setPerPage] = useState(10)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [visibleCols, setVisibleCols] = useState([
    "nama",
    "kelas",
    "total_cup",
    "total_transaksi",
    "komisi",
    "bonus",
    "bayar",
  ])
  const tableRef = useRef()


    const fetchPeriodeList = async () => {
      try {
        const res = await apiFetch("/api/periode/belum-cair")

        if (res?.data) {
          setPeriode(res.data) 
        }
      } catch (err) {
        alert("Gagal memuat periode")
      }
    }
    useEffect(() => {
      fetchPeriodeList()
    }, [])

const fetchUsers = async (
  endDate = null,
  currentPage = page,
  currentPerPage = perPage,
  currentFilter = filter
) => {
  try {
    setLoading(true)
    setError("")

    const response = await apiFetch("/api/komisi/all", {
      method: "POST",
      body: JSON.stringify({
        search: debouncedSearch,
        periode_awal: periode?.start
          ? periode.start.slice(0, 10)
          : null,
        periode_akhir: endDate
          ? endDate
          : format(new Date(), "yyyy-MM-dd"),
        page: currentPage,
        per_page: currentPerPage,
        ...currentFilter
      }),
    })

    setData(response.data || [])
    setPagination(response.pagination)

  } catch (err) {
    setError(err.message || "Gagal memuat data")
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  if (!periode?.start) return

  fetchUsers(
    periodeAkhir ? format(periodeAkhir, "yyyy-MM-dd") : null,
    page,
    perPage,
    filter,
  )
}, [
  page,
  perPage,
  filter,
  debouncedSearch,
  periodeAkhir,
  periode?.start
])
useEffect(() => {
  const delay = setTimeout(() => {
    setDebouncedSearch(search)
    setPage(1) // reset ke page 1 saat search berubah
  }, 500)

  return () => clearTimeout(delay)
}, [search])

  const handleCairkanKomisi = async () => {
    if (!periode?.start) {
      alert("Periode belum tersedia")
      return
    }

    const petugasIds = [...new Set(data.map(item => item.id_petugas))]

    if (petugasIds.length === 0) {
      alert("Tidak ada data petugas")
      return
    }

    const ok = await confirm("Yakin cairkan komisi dan unduh Excel?")
    if (!ok) return

    console.log(periode.start, periodeAkhir)

    try {
      setLoadingCairkan(true)
      const today = new Date()

      const response = await apiFetch("/api/cairkan", {
        method: "POST",
        body: JSON.stringify({
          id_petugas: petugasIds,
          periode_awal: periode.start,
          periode_akhir: periodeAkhir ? format(periodeAkhir, "yyyy-MM-dd") : null,
        }),
      })
      if (response.file) {
        const link = document.createElement("a")
        link.href = response.file
        link.download = ""
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      alert("Komisi berhasil dicairkan")
      fetchUsers(today.toISOString().slice(0, 10))
      fetchPeriodeList()

    } catch (err) {
      alert(err.message || "Gagal mencairkan komisi")
    } finally {
      setLoadingCairkan(false)
    }
  }

  const summaryKomisi = async () => {
    if (!periode?.start) return

    try {
      const response = await apiFetch("/auth/komisi/summaryBulanan", {
        method: "POST",
        body: JSON.stringify({
          periode_awal: periode.start,
          periode_akhir: periodeAkhir
            ? format(periodeAkhir, "yyyy-MM-dd")
            : null,
        }),
      })
        setSummary(response)
console.log(response)
    } catch (err) {
      alert(err.message || "Gagal mengambil summary")
    }
  }
  useEffect(() => {
    if (!periode?.start) return
    summaryKomisi()
  }, [periode, periodeAkhir])

  const fetchkomisi = async () => {
    try {
      const response = await apiFetch("/api/komisi")
      setKomisi(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (ids) => {
    setSelectedIds(ids);
  };

  const formatTanggal = (date) =>
    format(new Date(date), "d MMMM yyyy", { locale: id });


  const handleSubmitKomisi = async (payload) => {
  try {
      await apiFetch("/api/komisi", {
      method: "PUT",
      body: JSON.stringify(payload),
      })
      setOpenKomisi(false)
      fetchkomisi()
      fetchUsers()
      fetchPeriodeList()
    } catch (err) {
        throw err
    }
  }
  useEffect(() => {
    fetchkomisi()
  }, [])

  const handleSubmitBonus = async ({ nominal, keterangan }) => {
    try {
      await apiFetch("/api/addBonus", {
        method: "POST",
        body: JSON.stringify({
          id_petugas: selectedIds,
          nominal,
          keterangan,
        }),
      })

      alert("Bonus berhasil ditambahkan")

      setSelectedIds([]) 
      setOpenBonus(false)
      fetchUsers()
      fetchPeriodeList()
    } catch (err) {
      alert(err.message || "Gagal menambahkan bonus")
    }
  }

  const getTotalExport = (rows) => {
    return rows.reduce(
      (acc, row) => {
        acc.total_bayar += Number(row.total_bayar || 0)
        return acc
      },
      {
        total_bayar: 0,
      }
    )
  }


  const formatDateFile = (date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")

    printWindow.document.write(`
      <html>
        <head>
          <title>Komisi Petugas</title>
          <style>
            body { font-family: Arial; padding: 20px }
            table { width: 100%; border-collapse: collapse }
            th, td { border: 1px solid #ccc; padding: 8px }
            th { background: #f4f4f4 }
          </style>
        </head>
        <body>
          <h3>Komisi Petugas</h3>
          <p>
            Periode:
            ${periode?.start ? formatTanggal(periode.start) : "-"}
            –
            ${periodeAkhir ? formatTanggal(periodeAkhir) : "-"}
          </p>
          ${printAreaRef.current?.innerHTML || ""}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleExportExcel = () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk diexport")
      return
    }

    const columnsMap = {
      nama: "Nama",
      kelas: "Kelas",
      komisi: "Komisi",
      bonus: "Bonus",
      bayar: "Total Bayar",
    }

    const excelData = data.map((row) => {
      const obj = {}
      visibleCols.forEach((col) => {
        switch (col) {
          case "komisi":
            obj[columnsMap[col]] = row.total_komisi
            break
          case "bonus":
            obj[columnsMap[col]] = row.total_bonus
            break
          case "bayar":
            obj[columnsMap[col]] = row.total_bayar
            break
          default:
            obj[columnsMap[col]] = row[col]
        }
      })
      return obj
    })
    const total = getTotalExport(data)
    const totalRow = {}

    visibleCols.forEach((col, index) => {
      if (index === 0) {
        totalRow[columnsMap[col]] = "TOTAL"
        return
      }

      switch (col) {
        case "bayar":
          totalRow[columnsMap[col]] = total.total_bayar
          break
        default:
          totalRow[columnsMap[col]] = ""
      }
    })

    excelData.push(totalRow)

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Komisi")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const start = periode?.start
      ? formatDateFile(periode.start)
      : "unknown"

    const end = periodeAkhir
      ? formatDateFile(periodeAkhir)
      : formatDateFile(new Date())

    saveAs(
      blob,
      `komisi_belum_dicairkan_${start}_sampai_${end}_${formatTimestamp()}.xlsx`
    )
  }

  const handlePrintDocx = async () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk dicetak")
      return
    }

    const columnsMap = {
      nama: "Nama",
      kelas: "Kelas",
      total_cup: "Total Cup",
      total_transaksi: "Total Transaksi",
      komisi: "Komisi",
      bonus: "Bonus",
      bayar: "Total Bayar",
    }

    const headerRow = new TableRow({
      children: visibleCols.map(
        (col) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: columnsMap[col],
                    bold: true,
                  }),
                ],
              }),
            ],
          })
      ),
    })

    const bodyRows = data.map(
      (row) =>
        new TableRow({
          children: visibleCols.map((col) => {
            let value = ""

            switch (col) {
              case "komisi":
                value = row.total_komisi
                break
              case "bonus":
                value = row.total_bonus
                break
              case "bayar":
                value = row.total_bayar
                break
              default:
                value = row[col]
            }

            return new TableCell({
              children: [new Paragraph(String(value ?? ""))],
            })
          }),
        })
    )
    const total = getTotalExport(data)

    const totalRow = new TableRow({
      children: visibleCols.map((col, index) => {
        let value = ""

        if (index === 0) value = "TOTAL"
        else {
          switch (col) {
            case "bayar":
              value = total.total_bayar
              break
            default:
              value = ""
          }
        }

        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: String(value),
                  bold: true,
                }),
              ],
            }),
          ],
        })
      }),
    })


    const table = new Table({
      rows: [headerRow, ...bodyRows, totalRow],
      width: {
        size: 100,
        type: "pct",
      },
    })

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "LAPORAN KOMISI",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 300 },
            }),
            new Paragraph(
              `Periode: ${formatDateFile(
                periode.start
              )} sampai ${formatDateFile(periodeAkhir)}`
            ),
            new Paragraph(" "),
            table,
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)

    const fileName = `komisi_belum_dicairkan_${formatDateFile(
      periode.start
    )}_sampai_${formatDateFile(periodeAkhir)}_${formatTimestamp()}.docx`

    saveAs(blob, fileName)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Komisi Petugas</h1>
          <p className="text-gray-600 mt-1">
            {periode  && (
              <div className="flex flex-col gap-1 text-gray-700">

                <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                  <span>
                    {formatTanggal(periode.start)}
                  </span>

                  <span className="text-gray-400">-</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className="
                          inline-flex items-center gap-1
                          cursor-pointer
                          text-gray-900
                          hover:text-primary
                          transition
                        "
                      >
                        <span className="hover:underline flex items-center gap-2 flex-row">
                          {periodeAkhir
                            ? formatTanggal(periodeAkhir)
                            : "Pilih tanggal"}
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                        </span>
                      </div>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={periodeAkhir}
                        onSelect={setPeriodeAkhir}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)

                          const start = new Date(periode.start)
                          start.setHours(0, 0, 0, 0)

                          return date > today || date < start
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button  
              size="icon"
              variant="outline">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <ActionMenu
              handleExportExcel={handleExportExcel}
              handlePrintDoc={handlePrintDocx}
              handlePrint={handlePrint}
              setOpenKomisi={setOpenKomisi}
            />
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      <FilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(value) => setFilter(value)}
      />

      <div>
        <div className="mb-4">
          <SummaryBulananCard
            data={summary}
            loading={!summary}
          />

          <ActiveFilters
            filter={filter}
            onClear={() => setFilter(null)}
          />
          <KomisiTable
            data={data}
            page={page}
            setPage={setPage}
            pageSize={perPage}
            setPageSize={setPerPage}
            pagination={pagination}
            tipeKomisi={komisi?.tipe}
            nilaiKomisi={komisi?.nilai}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            visibleCols={visibleCols}
            setVisibleCols={setVisibleCols}
            printAreaRef={printAreaRef}
            search={search}
            setSearch={setSearch}
            onCairkan={handleCairkanKomisi}
            onAddBonus={() => setOpenBonus(true)}
            onOpenFilter={() => setOpenFilter(true)}
          />
        </div>
        </div>
        <KomisiModal
        open={openKomisi}
        onClose={() => setOpenKomisi(false)}
        defaultValue={komisi}
        onSubmit={handleSubmitKomisi}
        />
        <AddBonusModal
          isOpen={openBonus}
          onClose={() => setOpenBonus(false)}
          onSubmit={handleSubmitBonus}
        />
    </div>
  )
}
