import { useState, useEffect } from "react"

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export default function PesananTable({
  data,
  loading,
  pagination,
  onPageChange,
  onSearchChange,
  onPerPageChange,
  formatDate,
  bahan,
  perPageOptions,
}) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearchChange?.(search)
    }, 500)

    return () => clearTimeout(delay)
  }, [search])
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

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between gap-2">
        <Input
            placeholder="Cari ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64 bg-white border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Stok Sistem</TableHead>
              <TableHead>Stok Real</TableHead>
              <TableHead>Selisih</TableHead>
              <TableHead>Selisih Persen</TableHead>
              <TableHead>Asyn By</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="py-4">
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="animate-spin w-6 h-6 border-b-2 border-primary rounded-full mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Tidak ada data pesanan
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{formatDate(row.synced_at)}</TableCell>
                  <TableCell>{formatNumber(row.stok_sistem)} {bahan.kode_satuan}</TableCell>
                  <TableCell>{formatNumber(row.stok_real)} {bahan.kode_satuan}</TableCell>
                  <TableCell>{formatNumber(row.selisih)} {bahan.kode_satuan}</TableCell>
                  <TableCell>{formatNumber(row.selisih_persen)}%</TableCell>
                  <TableCell>{row.petugas_fullname}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:items-center sm:justify-between gap-4 text-sm w-full">
        <div className="flex flex-row sm:items-center justify-between gap-4 text-sm w-full">
        <div className="flex items-center gap-2">
            <Select
            value={String(pagination.perPage)}
            onValueChange={(val) => {
                setPerPage(Number(val))
                setPage(1)
            }}
            >
            <SelectTrigger className="w-20 bg-white border border-gray-300">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {perPageOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                    {opt}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-4">

          <Button
            size="sm"
            variant="outline"
            disabled={pagination.current_page <= 1}
            onClick={() => onPageChange(pagination.current_page - 1)}
          >
            Prev
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={pagination.current_page >= pagination.total_page}
            onClick={() => onPageChange(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
        </div>
        <div className="flex justify-center items-center border-t pt-2 w-full" >
            <p className="text-sm text-muted-foreground">
              page{" "}
              <span className="font-medium text-foreground">
                {pagination.page}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-foreground">
                {pagination.totalPages}
              </span>{" "}
            </p>
        </div>
        
      </div>
    </div>
  )
}
