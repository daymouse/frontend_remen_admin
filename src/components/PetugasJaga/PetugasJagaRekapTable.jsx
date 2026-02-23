import { forwardRef, useMemo, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, X } from "lucide-react"

const ALL_COLUMNS = [
  { key: "nama", label: "Nama" },
  { key: "kelas", label: "Kelas" },
  { key: "total_jaga", label: "Total Jaga" },
  { key: "avg_check_in", label: "Rata-rata Check In" },
  { key: "tanggal_mulai", label: "Awal Jaga" },
  { key: "tanggal_terakhir", label: "Terakhir Jaga" },
]


const PetugasJagaRekapTable = forwardRef(
  (
    {
      data,
      limit,
      filter,
      onResetFilter,
      onLimitChange,
      onPrint,
      onExportExcel,
      onExportDoc,
      onExportData,
      onOpenFilter,
      onVisibleColumnsChange,
    },
    ref
  ) => {
    const [search, setSearch] = useState("")

    // FILTER SEARCH
    const filteredData = useMemo(() => {
      let result = data

      if (search) {
        result = result.filter((d) =>
          d.fullname.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (limit && limit !== "all") {
        result = result.slice(0, limit)
      }

      return result
    }, [search, data, limit])

    useEffect(() => {
      onExportData && onExportData(filteredData)
    }, [filteredData])

    const [visibleCols, setVisibleCols] = useState(
      ALL_COLUMNS.map((col) => col.key)
    )

    useEffect(() => {
      onVisibleColumnsChange && onVisibleColumnsChange(visibleCols)
    }, [visibleCols])



    const toggleColumn = (key) => {
      setVisibleCols((prev) =>
        prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key]
      )
    }

    const isFilterActive =
      filter &&
      Object.values(filter).some(
        (v) => v !== null && v !== "" && v !== undefined
      )

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
      <div ref={ref} className="space-y-3">
        {/* TOP BAR */}
        <div className="no-print flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Cari nama"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {isFilterActive && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Filter Aktif</Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onResetFilter}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {/* SHOW LIMIT */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Show ({limit === "all" ? "All" : limit})
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {[10, 20, 30, 40, 50].map((n) => (
                    <DropdownMenuItem
                      key={n}
                      onClick={() => onLimitChange(n)}
                    >
                      {n} data
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuItem
                    onClick={() => onLimitChange("all")}
                  >
                    Show All
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={onOpenFilter}>
                Filter
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={onPrint}>
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportExcel}>
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportDoc}>
                    Word (.docx)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Columns
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  {ALL_COLUMNS.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.key}
                      checked={visibleCols.includes(col.key)}
                      onCheckedChange={() => toggleColumn(col.key)}
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* TABLE */}
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleCols.includes("nama") && <TableHead>Nama</TableHead>}
                {visibleCols.includes("kelas") && <TableHead>Kelas</TableHead>}
                {visibleCols.includes("total_jaga") && <TableHead>Total Jaga</TableHead>}
                {visibleCols.includes("avg_check_in") && <TableHead>Avg Check In</TableHead>}
                {visibleCols.includes("tanggal_mulai") && <TableHead>Awal Jaga</TableHead>}
                {visibleCols.includes("tanggal_terakhir") && <TableHead>Terakhir Jaga</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    Data tidak ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, i) => (
                  <TableRow key={i}>
                    {visibleCols.includes("nama") && <TableCell>{item.fullname}</TableCell>}
                    {visibleCols.includes("kelas") && <TableCell>{item.kelas}</TableCell>}
                    {visibleCols.includes("total_jaga") && <TableCell>{item.total_jaga}</TableCell>}
                    {visibleCols.includes("avg_check_in") && <TableCell>{item.avg_check_in}</TableCell>}
                    {visibleCols.includes("tanggal_mulai") && 
                      <TableCell>
                        {formatTanggalIndo(item.tanggal_mulai)}
                      </TableCell>
                    }
                    {visibleCols.includes("tanggal_terakhir") &&
                      <TableCell>
                        {formatTanggalIndo(item.tanggal_terakhir)}
                      </TableCell>
                    }
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }
)

export default PetugasJagaRekapTable
