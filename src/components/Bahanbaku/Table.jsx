import { useState } from "react"
import {
  Table as UITable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoreVertical, Save, X } from "lucide-react"

export default function BahanBakuTable({
  data,
  search,
  setSearch,
  loading,
  page,
  setPage,
  perPage,
  setPerPage,
  totalPages,
  onDelete,
  onUpdate,
  onEdit,
  perPageOptions,
}) {

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function formatRupiah(value) {
    if (value == null) return "Rp 0"
    return `Rp ${Number(value).toLocaleString("id-ID")}`
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <Input
          placeholder="Cari bahan baku..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-background"
        />
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-background overflow-auto">
        <UITable>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Stok Sistem</TableHead>
              <TableHead>Minimal Stok</TableHead>
              <TableHead>Avg Cost</TableHead>
              <TableHead>Satuan</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((item) => {

              return (
                <TableRow key={item.id}>

                  {/* AKSI */}
                  <TableCell>
                    
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            Edit
                            </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(item.id, item.nama)}
                            className="text-red-600"
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>

                  {/* NAMA */}
                  <TableCell>
                      {item.nama}
                  </TableCell>

                  {/* TIPE */}
                  <TableCell>
                      {item.tipe}
                  </TableCell>

                  {/* STOK */}
                  <TableCell> {formatNumber(item.stok_sistem)} {item.satuan_kode}</TableCell>

                  {/* MINIMAL STOK */}
                  <TableCell>
                        {formatNumber(item.minimal_stok)} {item.satuan_kode}
                    </TableCell>

                  {/* AVG COST */}
                  <TableCell>{formatRupiah(item.avg_cost)}</TableCell>

                  {/* SATUAN */}
                  <TableCell>{item.satuan_tipe}</TableCell>

                </TableRow>
              )
            })}
          </TableBody>
        </UITable>
      </div>

      <div className="flex flex-col sm:items-center sm:justify-between gap-4 text-sm w-full">
        <div className="flex flex-row sm:items-center justify-between gap-4 text-sm w-full">
        <div className="flex items-center gap-2">
            <Select
            value={String(perPage)}
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

        {/* Page Info */}
        <div className="flex items-center gap-4">

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
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            >
            Next
            </Button>
        </div>
        </div>
        <div className="flex justify-center items-center border-t pt-2 w-full" >
            <p className="text-sm text-muted-foreground">
              page{" "}
              <span className="font-medium text-foreground">
                {page}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-foreground">
                {totalPages}
              </span>{" "}
            </p>
        </div>
        
      </div>
    </div>
  )
}