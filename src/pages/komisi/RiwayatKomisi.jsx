import { useEffect, useRef, useState,useMemo  } from "react"
import { apiFetch } from "@/server.jsx"
import FilterModal from "@/components/riwayatKomisi/FilterModal"
import { Button } from "@/components/ui/button"
import KomisiModal from "@/components/komisi/SettingModal.jsx"
import KomisiRiwayatTable from "@/components/riwayatKomisi/TabelRiwayat"
import AddBonusModal from "@/components/komisi/AddBonus.jsx"
import { useConfirm } from "@/components/providers/AlertConfirmProvider"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, MoreVertical } from "lucide-react"
import ActiveFilters from "@/components/riwayatKomisi/ActiveFilters";
import SummaryKomisiRiwayatCard from "@/components/riwayatKomisi/SummaryKomisiRiwayatCard"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "docx"



export default function RiwayatKomisi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openFilter, setOpenFilter] = useState(false)
  const { confirm, alert } = useConfirm()
  const [periodeList, setPeriodeList] = useState([])
  const [selectedPeriode, setSelectedPeriode] = useState(null)
  const printAreaRef = useRef(null)
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState({
    fullname: "",
    kelas: "",
    komisi_min: "",
    komisi_max: "",
    bonus_min: "",
    bonus_max: "",
    bayar_min: "",
    bayar_max: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_data: 0,
    total_page: 0,
  })

  const ALL_COLUMNS = ["nama", "kelas", "komisi", "bonus", "bayar"]
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS)

  const tableRef = useRef()
  const fetchPeriodeList = async () => {
    try {
      const res = await apiFetch("/api/periode")
      let list = res.data || []
      list = list.sort((a, b) => Number(b.id) - Number(a.id))

      setPeriodeList(list)

      if (list.length > 0) {
        setSelectedPeriode(list[0]) 
      }

    } catch (err) {
      alert("Gagal memuat periode")
    }
  }
  useEffect(() => {
    fetchPeriodeList()
  }, [])



  const fetchRiwayat = async (periode) => {
    try {
      setLoading(true)

      const res = await apiFetch("/api/riwayat", {
        method: "POST",
        body: JSON.stringify({
          id_batch: periode.id,

          page: page,
          per_page: perPage,

          search: debouncedSearch,
          fullname: filters.fullname || undefined,
          kelas: filters.kelas || undefined,

          komisi_min: filters.komisi_min || undefined,
          komisi_max: filters.komisi_max || undefined,

          bonus_min: filters.bonus_min || undefined,
          bonus_max: filters.bonus_max || undefined,

          bayar_min: filters.bayar_min || undefined,
          bayar_max: filters.bayar_max || undefined,
        }),
      })

      setData(
        (res.data || []).map(item => ({
          id_petugas: item.id_petugas,
          nama: item.fullname,
          kelas: item.kelas,
          total_komisi: item.total_komisi,
          total_bonus: item.total_bonus,
          total_bayar: item.total_dibayar,
        }))
      )

      // set pagination info
      setPagination(res.pagination)

    } catch (err) {
      setError("Gagal memuat data riwayat")
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
      if (selectedPeriode) {
        fetchRiwayat(selectedPeriode)
      }
    }, [page, perPage, filters, selectedPeriode, debouncedSearch,])


    useEffect(() => {
      const delay = setTimeout(() => {
        setDebouncedSearch(search)
        setPage(1)
      }, 500)

      return () => clearTimeout(delay)
    }, [search])

  const summaryKomisiRiwayat = async () => {
    if (!selectedPeriode?.id) return

    try {
      setLoadingSummary(true)

      const response = await apiFetch("/api/riwayat/summary", {
        method: "POST",
        body: JSON.stringify({
          id_batch: selectedPeriode.id,
        }),
      })

      setSummary(response.data)

    } catch (err) {
      alert(err.message || "Gagal mengambil summary")
    } finally {
      setLoadingSummary(false)
    }
  }
  useEffect(() => {
    if (selectedPeriode?.id) {
      summaryKomisiRiwayat()
    }
  }, [selectedPeriode])


  function getTimestamp() {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, "0")

    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
  }

    const formatDateFile = (date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
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
    const total = getTotalExport(data)

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
    excelData.push(
    visibleCols.reduce((acc, col, index) => {
      if (index === 0) {
        acc[columnsMap[col]] = "TOTAL"
      } else if (col === "bayar") {
        acc[columnsMap[col]] = total.total_bayar
      } else {
        acc[columnsMap[col]] = ""
      }
      return acc
    }, {})
  )



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
    const start = selectedPeriode
      ? formatDateFile(selectedPeriode.periode_awal)
      : "unknown"

    const end = selectedPeriode
    ? formatDateFile(selectedPeriode.periode_akhir)
    : formatDateFile(new Date())


    const timestamp = getTimestamp()

    const fileName = `komisi_belum_dicairkan_${start}_sampai_${end}_${timestamp}.xlsx`

    saveAs(blob, fileName)
  }

  const handlePrintDocx = async () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk dicetak")
      return
    }

    const total = getTotalExport(data)
    const columnsMap = {
      nama: "Nama",
      kelas: "Kelas",
      komisi: "Komisi",
      bonus: "Bonus",
      bayar: "Total Bayar",
    }

    // 🔹 Header Table
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
    const totalRow = new TableRow({
      children: visibleCols.map((col, index) => {
        let value = ""

        if (index === 0) value = "TOTAL"
        if (col === "bayar") value = total.total_bayar

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
                selectedPeriode.periode_awal
              )} sampai ${formatDateFile(selectedPeriode.periode_akhir)}`
            ),
            new Paragraph(" "),
            table,
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)

    const fileName = `komisi_belum_dicairkan_${formatDateFile(
      selectedPeriode.periode_awal
    )}_sampai_${formatDateFile(selectedPeriode.periode_akhir)}_${getTimestamp()}.docx`

    saveAs(blob, fileName)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")

    printWindow.document.write(`
      <html>
        <head>
          <title>Riwayat Komisi</title>
          <style>
            body { font-family: Arial; padding: 20px }
            table { width: 100%; border-collapse: collapse }
            th, td { border: 1px solid #ccc; padding: 8px }
            th { background: #f4f4f4 }
          </style>
        </head>
        <body>
          <h3>Riwayat Pencairan Komisi</h3>
          <p>Periode: ${selectedPeriode?.periode_awal} – ${selectedPeriode?.periode_akhir}</p>
          ${printAreaRef.current?.innerHTML || ""}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }



  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pencairan Komisi</h1>
          <p className="text-gray-600 mt-1">
            {selectedPeriode && (
              <div className="flex flex-col gap-1 text-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className="
                        inline-flex items-center gap-2
                        cursor-pointer
                        text-base font-medium text-gray-900
                        hover:text-primary
                        transition
                      "
                    >
                      <span>
                        {formatTanggalIndo(selectedPeriode.periode_awal)}
                        {" – "}
                        {formatTanggalIndo(selectedPeriode.periode_akhir)}
                      </span>
                      <CalendarIcon className="h-4 w-4 opacity-70" />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    {periodeList.map((p, i) => (
                      <DropdownMenuItem
                        key={i}
                        onClick={() => setSelectedPeriode(p)}
                      >
                        {formatTanggalIndo(p.periode_awal)}
                        {" – "}
                        {formatTanggalIndo(p.periode_akhir)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setOpenFilter(true)}>
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
                  <DropdownMenuItem onClick={handlePrintDocx}>
                    Word (.docx)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    <FilterModal
      open={openFilter}
      onClose={() => setOpenFilter(false)}
      onApply={(value) => {
        setPage(1) 
        setFilters(value)
      }}
    />

      <div>
        <div className="mb-4">
          <div className="mb-4 grid gap-4 lg:grid-cols-2 lg:items-center">
            
            </div>

            <SummaryKomisiRiwayatCard
              data={summary}
              loading={loadingSummary}
            />
            <ActiveFilters
              filter={filters}
              onClear={() => {
                setPage(1)
                setFilters({
                  fullname: "",
                  kelas: "",
                  komisi_min: "",
                  komisi_max: "",
                  bonus_min: "",
                  bonus_max: "",
                  bayar_min: "",
                  bayar_max: "",
                })
              }}
            />
              <KomisiRiwayatTable
                data={data}
                visibleCols={visibleCols}
                page={page}
                setPage={setPage}
                pageSize={perPage}
                setPageSize={setPerPage}
                pagination={pagination}
                printAreaRef={printAreaRef}
                search={search}
                setSearch={setSearch}
              />
        </div>
        </div>
    </div>
  )
}
