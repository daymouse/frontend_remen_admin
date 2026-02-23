import { useEffect, useState } from "react"
import { apiFetch } from "@/server"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FilterModalRekap({
  open,
  onClose,
  onApply,
  rangeTotal,
}) {
  const [namaList, setNamaList] = useState([])
  const [kelasList, setKelasList] = useState([])

  const [fullname, setFullname] = useState("")
  const [kelas, setKelas] = useState("")

  const [rangeValue, setRangeValue] = useState([0, 0])
  const [limit, setLimit] = useState(10)


  const [minTotal, setMinTotal] = useState(0)
  const [maxTotal, setMaxTotal] = useState(0)

  const [avgAwal, setAvgAwal] = useState("")
  const [avgAkhir, setAvgAkhir] = useState("")

  const [awalJaga, setAwalJaga] = useState()
  const [akhirJaga, setAkhirJaga] = useState()

  useEffect(() => {
    if (!open) return

    const min = rangeTotal?.min ?? 0
    const max = rangeTotal?.max ?? 0

    setMinTotal(min)
    setMaxTotal(max)
    setRangeValue([min, max])
  }, [open, rangeTotal])


  useEffect(() => {
    if (!open) return
    apiFetch("/api/fullname").then(r => setNamaList(r.data || []));
    apiFetch("/api/kelas").then(r => setKelasList(r.data || []));
  }, [open])

  const handleApply = () => {
    onApply({
      fullname,
      kelas,
      total_jaga_awal: rangeValue[0],
      total_jaga_akhir: rangeValue[1],
      avg_check_in_awal: avgAwal || null,
      avg_check_in_akhir: avgAkhir || null,
      tanggal_mulai_awal: awalJaga?.from
        ? format(awalJaga.from, "yyyy-MM-dd")
        : null,
      tanggal_mulai_akhir: awalJaga?.to
        ? format(awalJaga.to, "yyyy-MM-dd")
        : null,
      tanggal_terakhir_awal: akhirJaga?.from
        ? format(akhirJaga.from, "yyyy-MM-dd")
        : null,
      tanggal_terakhir_akhir: akhirJaga?.to
        ? format(akhirJaga.to, "yyyy-MM-dd")
        : null,
      limit, // ⬅ penting
    })

    onClose()
  }



  const handleReset = () => {
    setFullname("")
    setKelas("")
    setRangeValue([minTotal, maxTotal])
    setAvgAwal("")
    setAvgAkhir("")
    setAwalJaga(undefined)
    setAkhirJaga(undefined)
  }


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Rekap Petugas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* FULLNAME */}
          <SearchableDropdown
            label="Nama Petugas"
            value={fullname}
            setValue={setFullname}
            list={[...new Set(namaList.map(n => n.fullname))]}
          />


          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <SearchableDropdown
                label="Kelas"
                value={kelas}
                setValue={setKelas}
                list={kelasList.map((k) => k.kelas)}
              />
            </div>
          
            <div className="min-w-0">
              <label className="text-sm font-medium">Limit</label>
                 <Select
                    value={String(limit)}
                    onValueChange={(val) =>
                      setLimit(val === "all" ? "all" : Number(val))
                    }
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 30, 40, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                      <SelectItem value="all">
                        Show All
                      </SelectItem>
                    </SelectContent>
                  </Select>
             </div>
          </div>
          {/* TOTAL JAGA RANGE */}
          <div>
            <label className="text-sm font-medium">
              Total Jaga ({rangeValue[0]} - {rangeValue[1]})
            </label>
            <Slider
              min={minTotal}
              max={maxTotal}
              step={1}
              value={rangeValue}
              onValueChange={setRangeValue}
              className="mt-3"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium">
                Avg Check In
              </label>

              <div className="flex w-full items-center gap-2">
                <Input
                  type="time"
                  className="flex-1"
                  value={avgAwal}
                  onChange={(e) => {
                    setAvgAwal(e.target.value)
                    setAvgAkhir(e.target.value)
                  }}
                />

                <Input
                  type="time"
                  className="flex-1"
                  value={avgAkhir}
                  onChange={(e) => setAvgAkhir(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DateRangePicker
            label="Tanggal Awal Jaga"
            value={awalJaga}
            setValue={setAwalJaga}
          />

          <DateRangePicker
            label="Tanggal Terakhir Jaga"
            value={akhirJaga}
            setValue={setAkhirJaga}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleApply}>
              Terapkan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
function DateRangePicker({ label, value, setValue }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start mt-1"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from
              ? value.to
                ? `${format(value.from, "dd MMM yyyy")} - ${format(value.to, "dd MMM yyyy")}`
                : format(value.from, "dd MMM yyyy")
              : "Pilih tanggal"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={value}
            onSelect={setValue}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
function SearchableDropdown({
  label,
  value,
  setValue,
  list,
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-w-0">
      <label className="text-sm font-medium">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between mt-1 truncate"
          >
            <span className="truncate">
              {value || `Pilih ${label}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Cari ${label}...`} />
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>

            <CommandGroup className="max-h-60 overflow-auto">
              {list.map((item, i) => (
                <CommandItem
                  key={i}
                  value={item}
                  onSelect={(current) => {
                    setValue(current === value ? "" : current)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
