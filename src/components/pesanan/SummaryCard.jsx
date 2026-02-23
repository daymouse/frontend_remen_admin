import { useEffect, useState } from "react"
import { apiFetch } from "@/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const SummaryBulananCard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const res = await apiFetch("/api/summaryBulanan")
      if (res.success) setData(res.data)
    } catch (err) {
      console.error("Gagal mengambil summary")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const calculateChange = (current, previous) => {
    const diff = current - previous
    const percent = previous > 0 ? (diff / previous) * 100 : 0
    return {
      percent,
      isIncrease: diff >= 0,
    }
  }

  const cardNumberClass =
    "text-lg sm:text-xl lg:text-2xl font-bold leading-tight break-words"

  const renderSkeletonCard = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {renderSkeletonCard()}
        {renderSkeletonCard()}
        {renderSkeletonCard()}
        {renderSkeletonCard()}
      </div>
    )
  }

  if (!data) return null

  const now = data.bulan_sekarang
  const last = data.bulan_lalu
  const allTime = data.all_time

  const omzetChange = calculateChange(now.total_omzet, last.total_omzet)
  const pesananChange = calculateChange(now.total_pesanan, last.total_pesanan)
  const itemChange = calculateChange(now.total_item_terjual, last.total_item_terjual)

  const renderComparison = (change) => (
    <div className="flex items-center gap-1 text-[11px] sm:text-xs mt-1">
      {change.isIncrease ? (
        <ArrowUpRight className="w-3 h-3 text-green-600 shrink-0" />
      ) : (
        <ArrowDownRight className="w-3 h-3 text-red-600 shrink-0" />
      )}
      <span className={change.isIncrease ? "text-green-600" : "text-red-600"}>
        {change.percent.toFixed(1)}%
      </span>
      <span className="text-muted-foreground">vs bulan lalu</span>
    </div>
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm">
            Total Omzet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cardNumberClass}>
            {formatCurrency(now.total_omzet)}
          </p>
          {renderComparison(omzetChange)}
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">
            {formatCurrency(last.total_omzet)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm">
            Total Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cardNumberClass}>
            {now.total_pesanan}
          </p>
          {renderComparison(pesananChange)}
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">
            {last.total_pesanan}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm">
            Item Terjual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cardNumberClass}>
            {now.total_item_terjual}
          </p>
          {renderComparison(itemChange)}
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">
            {last.total_item_terjual}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm">
            Omzet All Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cardNumberClass}>
            {formatCurrency(allTime.total_omzet)}
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default SummaryBulananCard
