import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ActiveFilters({ filter, ranges, onClear }) {
  if (!filter || !ranges) return null;

  const items = [];

  const isChanged = (val, min, max) =>
    val[0] !== min || val[1] !== max;

  if (filter.nama) {
    items.push({
      key: "nama",
      label: filter.nama,
    });
  }

  if (filter.kelas) {
    items.push({
      key: "kelas",
      label: `Kelas: ${filter.kelas}`,
    });
  }

  if (filter.komisi && isChanged(filter.komisi, ranges.total_komisi.min, ranges.total_komisi.max)) {
    items.push({
      key: "komisi",
      label: `komisi: ${filter.komisi[0]}–${filter.komisi[1]}`,
    });
  }

  if (filter.bonus && isChanged(filter.bonus, ranges.total_bonus.min, ranges.total_bonus.max)) {
    items.push({
      key: "bonus",
      label: `Bonus: ${filter.bonus[0]}–${filter.bonus[1]}`,
    });
  }

  if (filter.bayar && isChanged(filter.bayar, ranges.total_bayar.min, ranges.total_bayar.max)) {
    items.push({
      key: "bayar",
      label: `Bayar: ${filter.bayar[0]}–${filter.bayar[1]}`,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-500">Filter aktif:</span>

      {items.map((item) => (
        <Badge key={item.key} variant="secondary" className="px-3 py-1">
          {item.label}
        </Badge>
      ))}

      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="h-7 px-2 text-gray-500"
      >
        <X className="w-4 h-4 mr-1" />
        Reset
      </Button>
    </div>
  );
}
