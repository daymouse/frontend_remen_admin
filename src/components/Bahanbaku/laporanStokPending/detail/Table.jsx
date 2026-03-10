import { useState } from "react"
import {
  Table as UITable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { NavLink } from "react-router-dom";

export default function BahanBakuTable({
  petugas,
  data,
  search,
  setSearch,
  loading,
  page,
  setPage,
  perPage,
  setPerPage,
  totalPages,
  onApprove,
  onReject,
  perPageOptions,
}) {

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onApprove}>
                Approve
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onReject}
                className="text-red-600"
              >
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-lg border bg-background overflow-auto">
        <UITable>
          <TableHeader>
            <TableRow>
              <TableHead>Bahan</TableHead>
              <TableHead>Real Stok</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((item) => {

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.bahan.nama}
                  </TableCell>
                  <TableCell>
                    {item.stok_real_input} {item.bahan.kode_satuan}
                  </TableCell>
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