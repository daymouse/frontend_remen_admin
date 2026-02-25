import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "@/server"

import DetailProdukCard from "@/components/detailProduk/DetailProdukCard"
import ResepProdukCard from "@/components/detailProduk/ResepProdukCard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DetailProdukPage = () => {
  const { id } = useParams()

  const [produk, setProduk] = useState(null)
  const [resep, setResep] = useState(null)
  const [loadingProduk, setLoadingProduk] = useState(true)
  const [loadingResep, setLoadingResep] = useState(true)
  const [error, setError] = useState(null)

  const fetchProduk = async () => {
    try {
      setLoadingProduk(true)
      const res = await apiFetch(`/auth/produk/${id}`)
      if (res.success) {
        setProduk(res.data)
      }
    } catch (err) {
      setError("Gagal mengambil data produk")
    } finally {
      setLoadingProduk(false)
    }
  }

  const fetchResep = async () => {
    try {
      setLoadingResep(true)
      const res = await apiFetch(`/auth/recep/${id}`)
      if (res.success) {
        setResep(res)
      }
    } catch (err) {
      setResep(null) // kalau belum ada resep
    } finally {
      setLoadingResep(false)
    }
  }

  useEffect(() => {
    fetchProduk()
    fetchResep()
  }, [id])

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
    <div className="p-4 max-w-6xl mx-auto">

        <div className="flex flex-col lg:flex-row gap-4 w-full">

            <div className="flex-1">
                {loadingProduk ? (
                <Skeleton className="h-40 w-full rounded-xl" />
                ) : (
                <DetailProdukCard data={produk} />
                )}
            </div>

            <div className="flex-1">
                {loadingResep ? (
                <Skeleton className="h-40 w-full rounded-xl" />
                ) : (
                <ResepProdukCard 
                data={resep} 
                productId={id}
                />
                )}
            </div>

        </div>

    </div>
  )
}

export default DetailProdukPage