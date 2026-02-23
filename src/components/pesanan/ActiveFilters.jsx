import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function ActiveFilters({ filters, ranges, onClear }) {
  if (!filters || !ranges) return null

  const items = []

  const isRangeChanged = (minVal, maxVal, defaultMin, defaultMax) => {
  if (
    minVal === undefined ||
    maxVal === undefined ||
    minVal === null ||
    maxVal === null ||
    minVal === "" ||
    maxVal === ""
  ) {
    return false
  }

  const min = Number(minVal)
  const max = Number(maxVal)

  if (isNaN(min) || isNaN(max)) return false

  return min !== defaultMin || max !== defaultMax
}

  // Tanggal
  if (filters.tanggalAwal) {
    items.push({
      key: "tanggalAwal",
      label: `Dari: ${filters.tanggalAwal}`
    })
  }

  if (filters.tanggalAkhir) {
    items.push({
      key: "tanggalAkhir",
      label: `Sampai: ${filters.tanggalAkhir}`
    })
  }

  // Produk
  if (filters.produkId) {
    items.push({
      key: "produk",
      label: "Produk dipilih"
    })
  }

  // Petugas
  if (filters.fullname) {
    items.push({
      key: "petugas",
      label: `Petugas: ${filters.fullname}`
    })
  }

  // Harga
  if (
    isRangeChanged(
      filters.hargaMin,
      filters.hargaMax,
      ranges?.harga?.min ?? 0,
      ranges?.harga?.max ?? 0
    )
  ) {
    items.push({
      key: "harga",
      label: `Harga: ${filters.hargaMin}–${filters.hargaMax}`
    })
  }

  // Item Terjual
  if (
    isRangeChanged(
      filters.minTerjual,
      filters.maxTerjual,
      ranges?.item_terjual?.min ?? 0,
      ranges?.item_terjual?.max ?? 0
    )
  ) {
    items.push({
      key: "item",
      label: `Item: ${filters.minTerjual}–${filters.maxTerjual}`
    })
  }

  if (items.length === 0) return null

return (
  <div className="flex flex-wrap items-center gap-2 mb-4 p-3">

    {items.map((item) => (
      <Badge
        key={item.key}
        className="px-3 py-1 text-sm font-medium bg-white text-black border border-gray-300"
        >
        {item.label}
    </Badge>

    ))}

    <Button
      size="sm"
      variant="outline"
      onClick={onClear}
      className="h-8 px-3 font-medium"
    >
      <X className="w-4 h-4 mr-1" />
      Reset
    </Button>
  </div>
)

}
