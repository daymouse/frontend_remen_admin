import { useEffect, useRef, useState } from "react"
import { apiFetch } from "../server.jsx"
import PetugasJagaTable from "@/components/PetugasJaga/PetugasJagaTable.jsx"
import PetugasJagaRekapTable from "@/components/PetugasJaga/PetugasJagaRekapTable.jsx"
import FilterModalDetail from "@/components/PetugasJaga/FilterModalDetail.jsx"
import FilterModalRekap from "@/components/PetugasJaga/FilterModalRekap.jsx"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { ChevronLeft } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"




export default function PetugasJaga() {
  const [mode, setMode] = useState("detail") // detail | rekap
  const [data, setData] = useState([])
  const [openModeSwitcher, setOpenModeSwitcher] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const [limit, setLimit] = useState(10)
  const [displayData, setDisplayData] = useState([])
  const [filterDetail, setFilterDetail] = useState(null)
  const [filterRekap, setFilterRekap] = useState(null)
  const [rangeTotal, setRangeTotal] = useState({ min: 0, max: 0 })
  const [visibleRekapCols, setVisibleRekapCols] = useState([])
  const isShowAll = mode === "rekap" && limit === "all"


  const tableRef = useRef()

  const fetchData = async () => {
    try {
      setLoading(true)

      const endpoint =
        mode === "detail"
          ? "/auth/get-petugas-jaga-filter"
          : "/api/rekap-absensi"

      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          limit: isShowAll ? null : limit,
          showAll: isShowAll,
          ...(mode === "detail" ? filterDetail : filterRekap),
        }),

      })

      setData(response.data || [])

      if (response.range_total_jaga) {
        setRangeTotal(response.range_total_jaga)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

const getFormattedData = () => {
  if (displayData.length === 0) return []

  if (mode === "detail") {
    return displayData.map((item) => ({
      Nama: item.fullname,
      Kelas: item.kelas,
      Tanggal: formatTanggalIndo(item.tanggal),
      "Check In": formatJam(item.check_in),
    }))
  }
  const columnMap = {
    nama: {
      label: "Nama",
      value: (item) => item.fullname,
    },
    kelas: {
      label: "Kelas",
      value: (item) => item.kelas,
    },
    total_jaga: {
      label: "Total Jaga",
      value: (item) => item.total_jaga,
    },
    avg_check_in: {
      label: "Rata-rata Check In",
      value: (item) => item.avg_check_in,
    },
    tanggal_mulai: {
      label: "Tanggal Mulai",
      value: (item) => formatTanggalIndo(item.tanggal_mulai),
    },
    tanggal_terakhir: {
      label: "Tanggal Terakhir",
      value: (item) => formatTanggalIndo(item.tanggal_terakhir),
    },
  }

  return displayData.map((item) => {
    const row = {}

    visibleRekapCols.forEach((key) => {
      if (columnMap[key]) {
        row[columnMap[key].label] =
          columnMap[key].value(item)
      }
    })

    return row
  })
}


  const handlePrint = () => {
    if (!tableRef.current) return

    const printContents = tableRef.current.innerHTML
    const printWindow = window.open("", "", "width=900,height=700")

    printWindow.document.write(`
      <html>
        <head>
          <title>Data Petugas Jaga</title>
          <style>
            @media print {
              .no-print {
                display: none !important;
              }
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            table, th, td {
              border: 1px solid black;
            }

            th, td {
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h2>Data Petugas Jaga</h2>
          ${printContents}
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

  const formatJam = (dateTimeStr) => {
    if (!dateTimeStr) return "-"
    return dateTimeStr.slice(11, 16)
  }

  const handleExportExcel = () => {
    if (displayData.length === 0) return

    const formattedData = getFormattedData()

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      mode === "detail" ? "Detail" : "Rekap"
    )

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const today = new Date()
    const formattedDate = today.toLocaleDateString("id-ID").replace(/\//g, "-")

    saveAs(
      blob,
      `data_petugas_jaga_${mode}_${formattedDate}.xlsx`
    )
  }
  const handleExportDoc = () => {
    if (displayData.length === 0) return

    const formattedData = getFormattedData()

    const headers = Object.keys(formattedData[0])
    const rows = formattedData
      .map(
        (item) => `
          <tr>
            ${headers.map((h) => `<td>${item[h]}</td>`).join("")}
          </tr>
        `
      )
      .join("")

    const content = `
      <html>
        <body>
          <h2>Data Petugas Jaga (${mode.toUpperCase()})</h2>
          <table border="1" style="border-collapse:collapse; width:100%">
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `

    const blob = new Blob(["\ufeff", content], {
      type: "application/msword",
    })

    const today = new Date()
    const formattedDate = today.toLocaleDateString("id-ID").replace(/\//g, "-")

    saveAs(
      blob,
      `data_petugas_jaga_${mode}_${formattedDate}.doc`
    )
  }


  useEffect(() => {
    fetchData()
  }, [mode, filterDetail, filterRekap, limit])

  useEffect(() => {
    if (mode === "detail" && limit === "all") {
      setLimit(10)
    }
  }, [mode])

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Jaga Petugas</h1>
          <p className="text-gray-600">
            {mode === "detail"
              ? "Data jaga harian"
              : "Rekap jaga per petugas"}
          </p>
        </div>

        <Collapsible open={openModeSwitcher} onOpenChange={setOpenModeSwitcher}>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              onClick={() => setOpenModeSwitcher(!openModeSwitcher)}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${
                  openModeSwitcher ? "rotate-180" : ""
                }`}
              />
            </Button>
            <CollapsibleContent  className="transition-all duration-400">
              <div className="flex gap-2">
                <Button
                  variant={mode === "detail" ? "default" : "outline"}
                  onClick={() => {
                    setMode("detail")
                    setOpenModeSwitcher(false) 
                  }}
                >
                  Detail
                </Button>

                <Button
                  variant={mode === "rekap" ? "default" : "outline"}
                  onClick={() => {
                    setMode("rekap")
                    setOpenModeSwitcher(false)
                  }}
                >
                  Rekap
                </Button>
              </div>
            </CollapsibleContent>

          </div>
        </Collapsible>
      </div>
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          {mode === "detail" && (
            <PetugasJagaTable
              ref={tableRef}
              data={data}
              limit={limit}
              filter={filterDetail}
              onResetFilter={() => {
                setFilterDetail(null)
                setLimit(10)
              }}
              onLimitChange={(val) => setLimit(val)}
              onPrint={handlePrint}
              onExportExcel={handleExportExcel}
              onExportDoc={handleExportDoc}
              onExportData={setDisplayData}
              onOpenFilter={() => setOpenFilter(true)}
            />
          )}

          {mode === "rekap" && (
            <PetugasJagaRekapTable
              ref={tableRef} 
              data={data} 
              limit={limit}
              filter={filterRekap}
              onResetFilter={() => {
                setFilterRekap(null)
                setLimit(10)
              }}
              onLimitChange={(val) => setLimit(val)}
              onPrint={handlePrint}
              onExportExcel={handleExportExcel}
              onExportDoc={handleExportDoc}
              onExportData={setDisplayData}
              onOpenFilter={() => setOpenFilter(true)}
              onVisibleColumnsChange={setVisibleRekapCols}
            />
          )}
        </>
      )}
      {mode === "detail" ? (
        <FilterModalDetail
          open={openFilter}
          onClose={() => setOpenFilter(false)}
          onApply={(value) => {
            setLimit(value.limit)
             setFilterDetail(value)
          }}
        />
      ) : (
        <FilterModalRekap
          open={openFilter}
          onClose={() => setOpenFilter(false)}
          rangeTotal={rangeTotal}
          onApply={(value) => {
            setFilterRekap(value)
          }}
        />
      )}


    </div>
  )
}
