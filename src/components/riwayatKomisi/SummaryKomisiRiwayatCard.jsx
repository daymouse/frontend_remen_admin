import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SummaryKomisiRiwayatCard = ({ data, loading }) => {

  const toNumber = (val) => Number(val || 0)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(toNumber(amount))

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

  if (!data) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

      {/* Total Komisi */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Komisi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatCurrency(data.total_komisi)}
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
            {formatCurrency(data.total_bonus)}
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
            {formatCurrency(data.total_dibayar)}
          </p>
        </CardContent>
      </Card>

      {/* Jumlah Petugas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Jumlah Petugas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {toNumber(data.jumlah_petugas)} petugas
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default SummaryKomisiRiwayatCard