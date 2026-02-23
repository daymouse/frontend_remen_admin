import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const SummaryBulananCard = ({ data, loading }) => {

  const toNumber = (val) => Number(val || 0)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(toNumber(amount))

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


  if (!data?.summary_sekarang) return null

  const now = data.summary_sekarang
  const last = data.summary_lalu || {}

  const komisiChange = calculateChange(
    now.total_komisi,
    last.total_komisi
  )

  const bonusChange = calculateChange(
    now.total_bonus,
    last.total_bonus
  )

  const dibayarChange = calculateChange(
    now.total_dibayar,
    last.total_dibayar
  )

  const petugasChange = calculateChange(
    now.total_petugas,
    last.total_petugas
  )

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
      <span className="text-muted-foreground">vs periode lalu</span>
    </div>
  )

  return (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

    {/* Total Komisi */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Total Komisi</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">
          {formatCurrency(now.total_komisi)}
        </p>
        {renderComparison(komisiChange)}
        <p className="text-xs text-muted-foreground mt-2">
          {formatCurrency(last.total_komisi)}
        </p>
      </CardContent>
    </Card>

    {/* Total Bonus */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Total Bonus</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">
          {formatCurrency(now.total_bonus)}
        </p>
            
            {renderComparison(bonusChange)}
        <p className="text-xs text-muted-foreground mt-2">
          {formatCurrency(last.total_bonus)}
        </p>
      </CardContent>
    </Card>

    {/* Total Dibayar */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Total Dibayar</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">
          {formatCurrency(now.total_dibayar)}
        </p>
        {renderComparison(dibayarChange)}
        <p className="text-xs text-muted-foreground mt-2">
          {formatCurrency(last.total_dibayar)}
        </p>
      </CardContent>
    </Card>

    {/* Total Petugas */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Total Petugas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">
          {toNumber(now.total_petugas)} petugas
        </p>
        {renderComparison(petugasChange)}
        <p className="text-xs text-muted-foreground mt-2">
          {toNumber(last.total_petugas)} petugas
        </p>
      </CardContent>
    </Card>

  </div>
)
}

export default SummaryBulananCard