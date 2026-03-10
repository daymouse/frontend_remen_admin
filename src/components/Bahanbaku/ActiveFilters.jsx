import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function ActiveFilters({ filter, onClear }) {
  if (!filter) return null

  const items = []

  if (filter.tipe) {
    items.push({
      key: "tipe",
      label: `Tipe: ${filter.tipe}`,
    })
  }

  if (filter.satuan_tipe) {
    items.push({
      key: "satuan_tipe",
      label: `Satuan: ${filter.satuan_tipe}`,
    })
  }

  if (filter.avg_cost_min) {
    items.push({
      key: "avg_cost_min",
      label: `Avg Cost ≥ ${filter.avg_cost_min}`,
    })
  }

  if (filter.avg_cost_max) {
    items.push({
      key: "avg_cost_max",
      label: `Avg Cost ≤ ${filter.avg_cost_max}`,
    })
  }

  if (filter.start_date || filter.end_date) {
    items.push({
      key: "date",
      label: `Tanggal: ${filter.start_date || "..."} – ${filter.end_date || "..."}`,
    })
  }

  if (filter.low_stock) {
    items.push({
      key: "low_stock",
      label: `Stok Rendah`,
    })
  }

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">

      {items.map((item) => (
        <Badge
          key={item.key}
          variant="secondary"
          className="px-3 py-1 bg-background border border-gray-300"
        >
          {item.label}
        </Badge>
      ))}

      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="h-7 px-2"
      >
        <X className="w-4 h-4 mr-1" />
        Reset
      </Button>
    </div>
  )
}