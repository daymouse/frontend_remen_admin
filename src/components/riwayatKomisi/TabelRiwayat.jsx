import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

function formatRupiah(value) {
  if (value == null) return "Rp 0"
  return `Rp ${Number(value).toLocaleString("id-ID")}`
}

export default function KomisiRiwayatTable({
  data,
  visibleCols,
  setVisibleCols,
  allColumns,
  printAreaRef,
}) {


  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.nama?.toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  )
  
  const totalBayar = useMemo(() => {
    return paginatedData.reduce(
      (sum, item) => sum + Number(item.total_bayar || 0),
      0
    )
  }, [paginatedData])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-auto"  id="printArea" ref={printAreaRef}>
        <Table>
          <TableHeader>
            <TableRow>

              {visibleCols.includes("nama") && (
                <TableHead>Nama</TableHead>
              )}
              {visibleCols.includes("kelas") && (
                <TableHead>Kelas</TableHead>
              )}
              {visibleCols.includes("komisi") && (
                <TableHead>
                  Komisi
                </TableHead>
              )}
              {visibleCols.includes("bonus") && (
                <TableHead>Bonus</TableHead>
              )}
              {visibleCols.includes("bayar") && (
                <TableHead>Total Bayar</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id_petugas}>

                {visibleCols.includes("nama") && (
                  <TableCell>{row.nama}</TableCell>
                )}
                {visibleCols.includes("kelas") && (
                  <TableCell>{row.kelas}</TableCell>
                )}
                {visibleCols.includes("komisi") && (
                  <TableCell>
                    {formatRupiah(row.total_komisi)}
                  </TableCell>
                )}
                {visibleCols.includes("bonus") && (
                  <TableCell>
                    {formatRupiah(row.total_bonus)}
                  </TableCell>
                )}
                {visibleCols.includes("bayar") && (
                  <TableCell>
                    {formatRupiah(row.total_bayar)}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {paginatedData.length > 0 && (
              <TableRow className="font-semibold bg-gray-50">
                <TableCell colSpan={
                  visibleCols.filter((c) => c !== "bayar").length
                }>
                  Total
                </TableCell>

                {visibleCols.includes("bayar") && (
                  <TableCell>
                    {formatRupiah(totalBayar)}
                  </TableCell>
                )}
              </TableRow>
            )}


            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-6 text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>
          {paginatedData.length} dari {filteredData.length} data
        </span>

        <div className="flex items-center gap-4">
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
          </select>
        </div>
      </div>
    </div>
  )
}
