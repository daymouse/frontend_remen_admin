import { useEffect, useState } from "react"
import { apiFetch } from "@/server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import StokRealForm from "@/components/Bahanbaku/realStokReport/StokRealForm"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, UserPlus, CheckCircle, XCircle  } from "lucide-react"

const StokRealPage = () => {
  const [bahan, setBahan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBahan = async () => {
    try {
      setLoading(true)
      const res = await apiFetch("/api/bahan-baku")
      if (res.success) {
        setBahan(res.data)
      }
    } catch (err) {
      setError("Gagal mengambil data bahan baku")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBahan()
  }, [])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

     return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex flex-row items-center justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Stok Bahan Baku</h1>
          <p className="text-gray-600 mt-1">Kelola data bahan baku</p>
        </div>
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="relative" variant="outline">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                className="cursor-pointer"
              >
                Tambah Bahan
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                
                  Laporan Stok
              </DropdownMenuItem>
              <DropdownMenuItem
                >
                Filter
                </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  <DropdownMenuItem >
                    Print
                  </DropdownMenuItem>

                  <DropdownMenuItem >
                    Excel (.xlsx)
                  </DropdownMenuItem>

                  <DropdownMenuItem >
                    Word (.docx)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Laporan Stok Real</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <StokRealForm bahan={bahan} onSuccess={fetchBahan} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StokRealPage
