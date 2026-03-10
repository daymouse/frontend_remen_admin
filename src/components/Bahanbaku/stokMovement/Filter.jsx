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

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

import { format } from "date-fns"
import { apiFetch } from "@/server"

export default function FilterStockMovementModal({
  open,
  onClose,
  onApply,
  currentFilter,
}) {

  const [filter, setFilter] = useState({
    type: "",
    reference_type: "",
    start_date: "",
    end_date: "",
  })

  const [referenceTypes, setReferenceTypes] = useState([])
  const [tanggalRange, setTanggalRange] = useState()

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

  /**
   * Ambil reference type saat modal dibuka
   */
  useEffect(() => {
    if (!open) return

    const fetchReferenceTypes = async () => {
      try {
        const res = await apiFetch("/api/referenceTypes")

        if (res.success) {
          setReferenceTypes(res.data)
        }
      } catch (err) {
        console.error("Gagal mengambil reference type")
      }
    }

    fetchReferenceTypes()
  }, [open])

  const handleChange = (field, value) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleReset = () => {
    const reset = {
      type: "",
      reference_type: "",
      start_date: "",
      end_date: "",
    }

    setFilter(reset)
    setTanggalRange(undefined)
    onApply(reset)
  }

  const handleSubmit = () => {

    const finalFilter = {
      ...filter,
      start_date: tanggalRange?.from
        ? format(tanggalRange.from, "yyyy-MM-dd")
        : "",
      end_date: tanggalRange?.to
        ? format(tanggalRange.to, "yyyy-MM-dd")
        : "",
    }

    onApply(finalFilter)
    onClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
        sm:max-w-md
        max-h-[90dvh]
        overflow-y-auto
        pb-28 md:pb-10
      "
      >
        <DialogHeader>
          <DialogTitle>Filter Stock Movement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* TYPE */}
          <div className="space-y-2">
            <Label>Type</Label>

            <Select
              value={filter.type}
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
                <SelectItem value="ADJUSTMENT">ADJUSTMENT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* REFERENCE TYPE */}
          <div className="space-y-2">
            <Label>Reference Type</Label>

            <Select
              value={filter.reference_type}
              onValueChange={(val) =>
                handleChange("reference_type", val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Reference" />
              </SelectTrigger>

              <SelectContent>
                {referenceTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DATE RANGE SHADCN */}
          <div className="space-y-2">
            <Label>Periode Tanggal</Label>

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