import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/server"

export default function UserSearch({ open, value, onChange }) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])

  // fetch semua user hanya sekali saat modal terbuka
  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      const res = await apiFetch("/api/manajement-user/all")
      const list = Array.isArray(res.data) ? res.data : []
      setAllUsers(list)
    }

    fetchUsers()
  }, [open])

  useEffect(() => {
    if (!query) {
      setUsers([])
      return
    }

    const filtered = allUsers.filter((u) =>
      u.fullname?.toLowerCase().includes(query.toLowerCase())
    )
    setUsers(filtered)
  }, [query, allUsers])

  return (
    <div className="relative">
      <label className="text-sm font-medium">
        User (opsional)
      </label>

      <Input
        placeholder="Cari user..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {users.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow">
          {users.map((u) => (
            <div
              key={u.id_petugas}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onChange(u)
                setQuery(u.fullname) 
                setUsers([])
              }}
            >
              {u.fullname}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
