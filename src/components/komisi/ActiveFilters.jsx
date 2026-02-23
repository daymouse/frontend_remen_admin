import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ActiveFilters({ filter, onClear }) {
  if (!filter) return null;

  const items = [];

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

  if (filter.cup_min || filter.cup_max) {
    items.push({
      key: "cup",
      label: `Cup: ${filter.cup_min ?? 0}–${filter.cup_max ?? "∞"}`,
    });
  }

  if (filter.transaksi_min || filter.transaksi_max) {
    items.push({
      key: "trx",
      label: `Trx: ${filter.transaksi_min ?? 0}–${filter.transaksi_max ?? "∞"}`,
    });
  }

  if (filter.komisi_min || filter.komisi_max) {
    items.push({
      key: "komisi",
      label: `Komisi: ${filter.komisi_min ?? 0}–${filter.komisi_max ?? "∞"}`,
    });
  }

  if (filter.bonus_min || filter.bonus_max) {
    items.push({
      key: "bonus",
      label: `Bonus: ${filter.bonus_min ?? 0}–${filter.bonus_max ?? "∞"}`,
    });
  }

  if (filter.bayar_min || filter.bayar_max) {
    items.push({
      key: "bayar",
      label: `Bayar: ${filter.bayar_min ?? 0}–${filter.bayar_max ?? "∞"}`,
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