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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

function formatRupiah(value) {
  if (value == null) return "Rp 0"
  return `Rp ${Number(value).toLocaleString("id-ID")}`
}

export default function KomisiRiwayatTable({
  data,
  visibleCols,
  page,
  setPage,
  pageSize,
  setPageSize,
  pagination,
  printAreaRef,
  search,
  setSearch,
}) {

  const totalBayar = useMemo(() => {
  return data.reduce(
    (sum, item) => sum + Number(item.total_bayar || 0),
    0
  )
}, [data])
  return (
    <div className="space-y-4">

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input
          placeholder="Cari nama atau kelas..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full sm:max-w-sm bg-background"
        />
      </div>

      {/* Table */}
      <div
        className="rounded-lg border bg-background overflow-auto"
        id="printArea"
        ref={printAreaRef}
      >
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
                <TableHead>Komisi</TableHead>
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
            {data.map((row) => (
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

            {data.length > 0 && (
              <TableRow className="font-semibold bg-gray-50">
                <TableCell
                  colSpan={
                    visibleCols.filter((c) => c !== "bayar").length
                  }
                >
                  Total
                </TableCell>

                {visibleCols.includes("bayar") && (
                  <TableCell>
                    {formatRupiah(totalBayar)}
                  </TableCell>
                )}
              </TableRow>
            )}

            {data.length === 0 && (
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
      <div className="flex flex-col sm:items-center sm:justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize ?? 10)}
              onValueChange={(val) => {
                setPageSize(Number(val))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-20 bg-white border border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pagination Info + Buttons */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={
                  page >= (pagination?.total_page || 1)
                }
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center border-t pt-2 w-full" >
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  (pagination?.page || 1) * (pagination?.per_page || pageSize),
                  pagination?.total_data || 0
                )}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-foreground">
                {pagination?.total_data || 0}
              </span>{" "}
              data
            </p>
        </div>
      </div>
    </div>
  )
}