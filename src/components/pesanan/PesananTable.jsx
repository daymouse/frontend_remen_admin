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
  onRowClick,
  formatCurrency,
  formatDate,
}) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearchChange?.(search)
    }, 500)

    return () => clearTimeout(delay)
  }, [search])

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between gap-2">
        <Input
            placeholder="Cari nama / kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64 bg-white border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary"
        />


        <div className="flex items-center gap-2 text-sm">
          <Select
            value={String(pagination.per_page)}
            onValueChange={(val) => onPerPageChange(Number(val))}
          >
            <SelectTrigger className="w-20 bg-white border border-gray-300 focus:ring-1 focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead>Total Item</TableHead>
              <TableHead className="text-right">Total Harga</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
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
              data.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => onRowClick(order)}
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.petugas?.fullname || order.petugas?.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.petugas?.kelas}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.total_item}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(order.total_harga)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Pagination */}
      <div className="flex flex-col sm:flex-row justify-end items-center text-sm gap-3">
            <p className="text-sm text-muted-foreground">
                Menampilkan{" "}
                <span className="font-medium text-foreground">
                    {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total_data
                    )}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-foreground">
                    {pagination.total_data}
                </span>{" "}
                data
            </p>

            <div className="flex gap-2">
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
                    disabled={pagination.current_page >= pagination.total_pages}
                    onClick={() => onPageChange(pagination.current_page + 1)}
                >
                    Next
                </Button>
            </div>
      </div>
    </div>
  )
}
