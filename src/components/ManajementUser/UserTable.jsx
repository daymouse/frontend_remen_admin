import { useState } from "react"
import {
  Table,
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoreVertical, Save, X } from "lucide-react"

export default function UserTable({
  users,
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
    perPageOptions   
}) {
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})

const startEdit = (user) => {
  setEditingId(user.id_petugas)
  setFormData({
    fullname: user.fullname || "",
    username: user.username_admin || "", 
    nickname: user.nickname || "",
    no_wa: user.no_wa || "",
    kelas: user.kelas || "",
  })
}



  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = (id) => {
    onUpdate(id, formData)
    cancelEdit()
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
            <Input
                placeholder="Cari"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            <div className="flex items-center gap-2">
                <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                >
                    {perPageOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                    ))}
                </select>
            </div>

        </div>

        <div className="rounded-lg border ">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Fullname</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>No WA</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Email</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {users.map((user) => {
                const isEditing = editingId === user.id_petugas

                return (
                <TableRow key={user.id_petugas}>
                    
                    {/* AKSI DI KIRI */}
                    <TableCell>
                    {isEditing ? (
                        <div className="flex gap-2">
                        <button
                            onClick={() => handleSave(user.id_petugas)}
                            className="text-sm text-green-600 hover:underline"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="text-sm text-gray-500 hover:underline"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        </div>
                    ) : (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                            onClick={() => startEdit(user)}
                            className="cursor-pointer"
                            >
                            Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                            onClick={() =>
                                onDelete(user.id_petugas, user.fullname)
                            }
                            className="text-red-600 cursor-pointer"
                            >
                            Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    </TableCell>

                    {/* USERNAME */}
                    <TableCell>
                    {isEditing ? (
                        <input
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={formData.username}
                        onChange={(e) =>
                            handleChange("username", e.target.value)
                        }
                        />
                    ) : (
                        user.username_admin
                    )}
                    </TableCell>

                    {/* NAMA */}
                    <TableCell>
                    {isEditing ? (
                        <input
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={formData.fullname}
                        onChange={(e) =>
                            handleChange("fullname", e.target.value)
                        }
                        />
                    ) : (
                        user.fullname
                    )}
                    </TableCell>

                    <TableCell>
                    {isEditing ? (
                        <input
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={formData.nickname}
                        onChange={(e) =>
                            handleChange("nickname", e.target.value)
                        }
                        />
                    ) : (
                        user.nickname
                    )}
                    </TableCell>

                    {/* NO WA */}
                    <TableCell>
                    {isEditing ? (
                        <input
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={formData.no_wa}
                        onChange={(e) =>
                            handleChange("no_wa", e.target.value)
                        }
                        />
                    ) : (
                        user.no_wa
                    )}
                    </TableCell>

                    {/* KELAS */}
                    <TableCell>
                    {isEditing ? (
                        <input
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={formData.kelas}
                        onChange={(e) =>
                            handleChange("kelas", e.target.value)
                        }
                        />
                    ) : (
                        user.kelas
                    )}
                    </TableCell>

                    {/* EMAIL (READ ONLY) */}
                    <TableCell className="text-muted-foreground">
                    {user.email}
                    </TableCell>

                </TableRow>
                )
            })}
            </TableBody>
        </Table>
        </div>
        <div className="flex justify-end items-center gap-4 mt-4">
  <span className="text-sm text-gray-600">
    Page {page} of {totalPages}
  </span>

  <Button
    variant="outline"
    size="sm"
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
  >
    Prev
  </Button>

  <Button
    variant="outline"
    size="sm"
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
  >
    Next
  </Button>
</div>

    </div>
  )
}
