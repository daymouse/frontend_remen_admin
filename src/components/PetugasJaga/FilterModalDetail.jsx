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
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FilterModalDetail({
  open,
  onClose,
  onApply,
}) {
  const [namaList, setNamaList] = useState([])
  const [kelasList, setKelasList] = useState([])

  const [fullname, setFullname] = useState("")
  const [kelas, setKelas] = useState("")

  const [tanggalAwal, setTanggalAwal] = useState(null)
  const [tanggalAkhir, setTanggalAkhir] = useState(null)

  const [checkinAwal, setCheckinAwal] = useState("")
  const [checkinAkhir, setCheckinAkhir] = useState("")

  const [limit, setLimit] = useState(10)

  const handleAwalChange = (date) => {
    setTanggalAwal(date)
    setTanggalAkhir(date) // otomatis ikut
  }

  useEffect(() => {
    if (!open) return
    apiFetch("/api/fullname").then(r => setNamaList(r.data || []));
    apiFetch("/api/kelas").then(r => setKelasList(r.data || []));
  }, [open])

  const handleApply = () => {
    onApply({
      fullname,
      kelas,
      tanggal_awal: tanggalAwal
        ? format(tanggalAwal, "yyyy-MM-dd")
        : null,
      tanggal_akhir: tanggalAkhir
        ? format(tanggalAkhir, "yyyy-MM-dd")
        : null,
      checkin_awal: checkinAwal || null,
      checkin_akhir: checkinAkhir || null,
      limit,
    })
    onClose()
  }

  const handleReset = () => {
    setFullname("")
    setKelas("")
    setTanggalAwal(undefined)
    setTanggalAkhir(undefined)
    setCheckinAwal("")
    setCheckinAkhir("")
    setLimit(10)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95vw]
          max-w-xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
        "
      >
        <DialogHeader>
          <DialogTitle>Filter Detail Petugas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* NAMA */}
          <SearchableDropdown
            label="Nama Petugas"
            value={fullname}
            setValue={setFullname}
            list={namaList.map((n) => n.fullname)}
          />

          {/* KELAS + LIMIT (tetap sejajar mobile & desktop) */}
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
                onValueChange={(val) => setLimit(Number(val))}
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
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TANGGAL AWAL & AKHIR tetap sejajar */}
          <div className="grid grid-cols-2 gap-3">
                
                {/* TANGGAL AWAL */}
                <div className="min-w-0">
                    <label className="text-sm font-medium">Tanggal Awal</label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        className="w-full justify-start mt-1 overflow-hidden"
                        >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {tanggalAwal
                            ? format(tanggalAwal, "dd MMM yyyy")
                            : "tanggal awal"}
                        </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={tanggalAwal}
                        onSelect={handleAwalChange}
                        />
                    </PopoverContent>
                    </Popover>
                </div>

                {/* TANGGAL AKHIR */}
                <div className="min-w-0">
                    <label className="text-sm font-medium">Tanggal Akhir</label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        className="w-full justify-start mt-1 overflow-hidden"
                        disabled={!tanggalAwal}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {tanggalAkhir
                            ? format(tanggalAkhir, "dd MMM yyyy")
                            : "tanggal akhir"}
                        </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={tanggalAkhir}
                        onSelect={setTanggalAkhir}
                        disabled={(date) =>
                            tanggalAwal && date < tanggalAwal
                        }
                        />
                    </PopoverContent>
                    </Popover>
                </div>
          </div>

          {/* CHECKIN AWAL & AKHIR tetap sejajar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                Checkin Awal
              </label>
              <Input
                type="time"
                className="mt-1 w-full"
                value={checkinAwal}
                onChange={(e) => {
                  const value = e.target.value
                  setCheckinAwal(value)
                  setCheckinAkhir(value)
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Checkin Akhir
              </label>
              <Input
                type="time"
                className="mt-1 w-full"
                value={checkinAkhir}
                onChange={(e) =>
                  setCheckinAkhir(e.target.value)
                }
              />
            </div>
          </div>

          {/* BUTTON */}
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

/* DATE PICKER */
function DatePicker({ label, value, setValue, disabledBefore }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-w-0">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start mt-1"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value
              ? format(value, "dd MMM yyyy")
              : "Pilih tanggal"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              setValue(date)
              setOpen(false)
            }}
            disabled={
              disabledBefore
                ? { before: disabledBefore }
                : undefined
            }
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
            <CommandInput
              placeholder={`Cari ${label}...`}
            />
            <CommandEmpty>
              Tidak ditemukan.
            </CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {list.map((item, i) => (
                <CommandItem
                  key={i}
                  value={item}
                  onSelect={(current) => {
                    setValue(
                      current === value ? "" : current
                    )
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
