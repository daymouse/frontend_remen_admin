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

export default function UserPendingTable({
  users,
  search,
  setSearch,
  loading,
  onApprove,
  onReject,
}) {
  return (
    <div className="space-y-4">

      {/* SEARCH */}
      <div className="flex justify-between">
        <Input
          placeholder="Cari nama, username, kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id_petugas}>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start">
                        <DropdownMenuItem
                            onClick={() => onApprove(user.id_petugas, user.fullname)}
                            className="cursor-pointer"
                        >
                            Approve
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => onReject(user.id_petugas, user.fullname)}
                            className="text-red-600 cursor-pointer"
                        >
                            Reject
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                    <TableCell>{user.user_username}</TableCell>
                    <TableCell>{user.fullname}</TableCell>
                    <TableCell>{user.nickname}</TableCell>
                    <TableCell>{user.no_wa}</TableCell>
                    <TableCell>{user.kelas}</TableCell>
                    <TableCell className="text-muted-foreground">
                    {user.email}
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
