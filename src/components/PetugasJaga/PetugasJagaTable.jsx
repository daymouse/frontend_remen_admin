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

const PetugasJagaTable = forwardRef(
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
    },
    ref
  ) => {
    const [search, setSearch] = useState("")

    const filteredData = useMemo(() => {
      if (!search) return data
      return data.filter((d) =>
        d.fullname.toLowerCase().includes(search.toLowerCase())
      )
    }, [search, data])

    useEffect(() => {
      onExportData(filteredData)
    }, [filteredData])

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

    const formatJam = (dateTimeStr) => {
      if (!dateTimeStr) return "-"
      return dateTimeStr.slice(11, 16)
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
                <Badge variant="secondary">
                  Filter Aktif
                </Badge>
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Show ({limit})
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
                </DropdownMenuSubContent>
              </DropdownMenuSub>

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

              <DropdownMenuItem onClick={onOpenFilter}>
                Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* TABLE */}
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Check In</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-10"
                  >
                    Data tidak ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.fullname}</TableCell>
                    <TableCell>{item.kelas}</TableCell>
                    <TableCell>
                      {formatTanggalIndo(item.tanggal)}
                    </TableCell>
                    <TableCell>
                      {formatJam(item.check_in)}
                    </TableCell>
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

export default PetugasJagaTable
