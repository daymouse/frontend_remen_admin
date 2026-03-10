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
import { useNavigate, NavLink } from "react-router-dom"

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
  onDelete,
  onUpdate,
  onEdit,
  perPageOptions,
  onReject,
  onApprove,
  selectedIds,
  setSelectedIds
}) {
  const navigate = useNavigate()
  const [selectionMode, setSelectionMode] = useState(false)

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = (ids) => {
    setSelectedIds(ids)
  }
  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return "-"

    const date = new Date(dateStr)

    const tanggal = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    const jam = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    return `${tanggal} ${jam}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <Input
          placeholder="Cari Fullname Atau Kelas"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-background"
        />
        <div className="flex items-center justify-end gap-2">
          {selectionMode && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onReject()
                  setSelectionMode(false)
                }}
                disabled={selectedIds.length === 0}
              >
                Reject
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedIds([])
                  setSelectionMode(false)
                }}
              >
                <X className="w-4 h-4 mr-1" />
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
               <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectionMode(true)
                  }}
                  className="text-red-600"
                >
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
          </div>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-background overflow-auto">
        <UITable>
          <TableHeader>
            <TableRow>
              <TableHead>
                {selectionMode && (
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 &&
                      data.every((d) => selectedIds.includes(d.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSelectAll(data.map((d) => d.id))
                      } else {
                        handleSelectAll([])
                      }
                    }}
                  />
                )}
              </TableHead>
              <TableHead>Fullname</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((item) => {

              return (
                <TableRow
                  key={item.id}
                  onClick={() => navigate(`/dashboard/stok-pending/${item.id}`)}
                  className="cursor-pointer hover:bg-gray-50 group"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {selectionMode ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggle(item.id)}
                      />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start">
                          <NavLink to={`/dashboard/stok-pending/${item.id}`}>
                            <DropdownMenuItem>
                              Detail
                            </DropdownMenuItem>
                          </NavLink>

                          <DropdownMenuItem onClick={() => onApprove(item)}>
                            Approve
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onReject(item)}
                            className="text-red-600"
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>

                  <TableCell className="group-hover:underline">
                    {item.petugas.fullname}
                  </TableCell>

                  <TableCell className="group-hover:underline">
                    {item.petugas.kelas}
                  </TableCell>

                  <TableCell className="group-hover:underline">
                    {item.status}
                  </TableCell>

                  <TableCell className="group-hover:underline">
                    {formatTanggalIndo(item.created_at)}
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