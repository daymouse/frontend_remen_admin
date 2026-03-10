import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const SummaryBulananCard = ({ data, loading, satuan }) => {

  const toNumber = (val) => Number(val || 0)

  const formatNumber = (amount) =>
    new Intl.NumberFormat("id-ID").format(toNumber(amount))

  const calculateChange = (current, previous) => {
    const curr = toNumber(current)
    const prev = toNumber(previous)

    const diff = curr - prev
    const percent = prev > 0 ? (diff / prev) * 100 : 0

    return {
      percent,
      isIncrease: diff >= 0,
    }
  }

  const renderSkeletonCard = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {renderSkeletonCard()}
        {renderSkeletonCard()}
        {renderSkeletonCard()}
        {renderSkeletonCard()}
      </div>
    )
  }

  if (!data?.summary_sekarang) return null

  const now = data.summary_sekarang
  const last = data.summary_lalu || {}

  const inChange = calculateChange(now.total_in, last.total_in)
  const outChange = calculateChange(now.total_out, last.total_out)
  const adjChange = calculateChange(now.total_adjustment, last.total_adjustment)
  const avgChange = calculateChange(now.total_transaksi, last.total_transaksi)

  const renderComparison = (change) => (
    <div className="flex items-center gap-1 text-xs mt-1">
      {change.isIncrease ? (
        <ArrowUpRight className="w-3 h-3 text-green-600" />
      ) : (
        <ArrowDownRight className="w-3 h-3 text-red-600" />
      )}
      <span className={change.isIncrease ? "text-green-600" : "text-red-600"}>
        {change.percent.toFixed(1)}%
      </span>
      <span className="text-muted-foreground">vs bulan lalu</span>
    </div>
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total IN</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(now.total_in)} {satuan}
          </p>
          {renderComparison(inChange)}
          <p className="text-xs text-muted-foreground mt-2">
            {formatNumber(last.total_in)} {satuan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total OUT</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(now.total_out)} {satuan}
          </p>
          {renderComparison(outChange)}
          <p className="text-xs text-muted-foreground mt-2">
            {formatNumber(last.total_out)} {satuan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(now.total_adjustment)} {satuan}
          </p>
          {renderComparison(adjChange)}
          <p className="text-xs text-muted-foreground mt-2">
            {formatNumber(last.total_adjustment)} {satuan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(now.total_transaksi)} 
          </p>
          {renderComparison(avgChange)}
          <p className="text-xs text-muted-foreground mt-2">
            {formatNumber(last.total_transaksi)} 
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default SummaryBulananCard