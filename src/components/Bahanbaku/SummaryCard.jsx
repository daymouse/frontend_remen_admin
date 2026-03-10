import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const InventorySummary = ({ data, loading }) => {

  const formatRupiah = (value) => {
    if (!value) return "Rp 0"
    return "Rp " + Number(value).toLocaleString("id-ID")
  }

  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleString("id-ID")
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

  if (!data) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Inventory Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatRupiah(data.total_inventory_value_sistem)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Nilai stok berdasarkan sistem
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Inventory Real</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatRupiah(data.total_inventory_value_real)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Nilai stok hasil stok opname
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Bahan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {data.total_bahan}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Bahan aktif di inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Last Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold">
            {formatDate(data.last_sync)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sinkronisasi stok terakhir
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default InventorySummary