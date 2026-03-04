import { useEffect, useState } from "react"
import { apiFetch } from "@/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const SummaryBulananCard = ({ summary, loading, satuan }) => {

const renderSkeletonCard = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-6 w-32" />
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

  if (!summary) return null

  const formatNumber = (val) =>
    new Intl.NumberFormat("id-ID").format(val || 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total IN</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(summary.total_in)} {satuan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total OUT</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(summary.total_out)} {satuan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(summary.total_adjustment)} {satuan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Rata-rata Qty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatNumber(summary.average_qty)} {satuan}
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default SummaryBulananCard