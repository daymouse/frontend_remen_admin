import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const formatRupiah = (value) => {
  if (!value) return ""
  return new Intl.NumberFormat("id-ID").format(value)
}

const parseNumber = (value) => {
  if (!value) return ""
  return value.toString().replace(/\D/g, "")
}

export default function FilterBahanBakuModal({
  open,
  onClose,
  onApply,
  currentFilter,
}) {
  const [tanggalRange, setTanggalRange] = useState()
  const [filter, setFilter] = useState({
    tipe: "",
    satuan_tipe: "",
    avg_cost_min: "",
    avg_cost_max: "",
    start_date: "",
    end_date: "",
    low_stock: false,
  })

  const [error, setError] = useState("")

  useEffect(() => {
    if (currentFilter) {
      setFilter(currentFilter)

      if (currentFilter.start_date || currentFilter.end_date) {
        setTanggalRange({
          from: currentFilter.start_date
            ? new Date(currentFilter.start_date)
            : undefined,
          to: currentFilter.end_date
            ? new Date(currentFilter.end_date)
            : undefined,
        })
      }
    }
  }, [currentFilter])

  const handleChange = (field, value) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
  const handleMinChange = (e) => {
    const raw = parseNumber(e.target.value)

    setFilter((prev) => {
      const newMin = raw
      let newMax = prev.avg_cost_max
      if (!newMax || Number(newMax) < Number(newMin)) {
        newMax = newMin
      }

      return {
        ...prev,
        avg_cost_min: newMin,
        avg_cost_max: newMax,
      }
    })

    setError("")
  }
  const handleMaxChange = (e) => {
    const raw = parseNumber(e.target.value)

    setFilter((prev) => ({
      ...prev,
      avg_cost_max: raw,
    }))

    if (!raw) {
      setError("")
      return
    }

    if (
      filter.avg_cost_min &&
      Number(raw) < Number(filter.avg_cost_min)
    ) {
      setError("Max tidak boleh lebih kecil dari Min")
    } else {
      setError("")
    }
  }
  const handleMaxBlur = () => {
    setFilter((prev) => {
      let newMax = prev.avg_cost_max

      if (!newMax && prev.avg_cost_min) {
        newMax = prev.avg_cost_min
      }

      if (
        prev.avg_cost_min &&
        Number(newMax) < Number(prev.avg_cost_min)
      ) {
        newMax = prev.avg_cost_min
      }

      return {
        ...prev,
        avg_cost_max: newMax,
      }
    })

    setError("")
  }

  const handleReset = () => {
    const resetValue = {
      tipe: "",
      satuan_tipe: "",
      avg_cost_min: "",
      avg_cost_max: "",
      start_date: "",
      end_date: "",
      low_stock: false,
    }

    setTanggalRange(undefined)
    setFilter(resetValue)
    setError("")
    onApply(resetValue)
  }

  const handleSubmit = () => {
    const min = Number(filter.avg_cost_min)
    const max = Number(filter.avg_cost_max)

    if (min && max && min > max) {
      setError("Min tidak boleh lebih besar dari Max")
      return
    }

    setError("")

    onApply({
      ...filter,
      avg_cost_min: min || "",
      avg_cost_max: max || "",
      start_date: tanggalRange?.from
        ? format(tanggalRange.from, "yyyy-MM-dd")
        : "",
      end_date: tanggalRange?.to
        ? format(tanggalRange.to, "yyyy-MM-dd")
        : "",
    })

    onClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="
        sm:max-w-md
        max-h-[90dvh]
        overflow-y-auto
        pb-32 md:pb-10
        ">
        <DialogHeader>
          <DialogTitle>Filter Bahan Baku</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* TIPE + SATUAN (SELALU ROW) */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>Tipe</Label>
              <Select
                value={filter.tipe}
                onValueChange={(val) => handleChange("tipe", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produksi">Produksi</SelectItem>
                  <SelectItem value="operasional">Operasional</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Satuan</Label>
              <Select
                value={filter.satuan_tipe}
                onValueChange={(val) =>
                  handleChange("satuan_tipe", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Satuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="berat">Berat</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="unit">Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AVG COST ROW */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>Avg Cost Min</Label>
              <Input
                placeholder="Rp 0"
                value={
                  filter.avg_cost_min
                    ? "Rp " + formatRupiah(filter.avg_cost_min)
                    : ""
                }
                onChange={handleMinChange}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label>Avg Cost Max</Label>
              <Input
                placeholder="Rp 0"
                value={
                  filter.avg_cost_max
                    ? "Rp " + formatRupiah(filter.avg_cost_max)
                    : ""
                }
                onChange={handleMaxChange}
                onBlur={handleMaxBlur}
              />
            </div>
          </div>
          <div className="space-y-4">
          <div className="space-y-2">
            <Label>Periode Last Sync</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {tanggalRange?.from
                    ? tanggalRange.to
                      ? `${format(tanggalRange.from, "dd MMM yyyy")} - ${format(tanggalRange.to, "dd MMM yyyy")}`
                      : format(tanggalRange.from, "dd MMM yyyy")
                    : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={tanggalRange}
                  onSelect={setTanggalRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
          

          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <Label>Stok Hampir Habis</Label>
              <p className="text-xs text-muted-foreground">
                Tampilkan bahan baku dengan stok di bawah minimal
              </p>
            </div>

            <Switch
              checked={filter.low_stock}
              onCheckedChange={(val) =>
                handleChange("low_stock", val)
              }
            />
          </div>

          {error && (
            <Alert>
              <AlertDescription>
                <span className="flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  {error}
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>

          <Button onClick={handleSubmit}>
            Terapkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}