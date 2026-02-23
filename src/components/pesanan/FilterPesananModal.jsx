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
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FilterPesananModal({
  isOpen,
  onClose,
  onApplyFilter,
  currentFilters,
  rangeData
}) {

  const [produkList, setProdukList] = useState([])
  const [petugasList, setPetugasList] = useState([])

  const [produkId, setProdukId] = useState("")
  const [fullname, setFullname] = useState("")


  const [hargaRange, setHargaRange] = useState([0, 0])
  const [itemRange, setItemRange] = useState([0, 0])

  const [tanggalRange, setTanggalRange] = useState()

  useEffect(() => {
    if (!isOpen) return

    setProdukId(currentFilters.produkId || "")
    setFullname(currentFilters.fullname || "")

    setHargaRange([
      currentFilters.hargaMin !== "" 
        ? Number(currentFilters.hargaMin)
        : rangeData?.harga?.min ?? 0,

      currentFilters.hargaMax !== ""
        ? Number(currentFilters.hargaMax)
        : rangeData?.harga?.max ?? 0
    ])


    console.log("currentFilters",rangeData?.harga?.min ?? 0, rangeData?.harga?.max ?? 0)

    setItemRange([
      currentFilters.minTerjual != null && currentFilters.minTerjual !== ""
        ? Number(currentFilters.minTerjual)
        : rangeData?.item_terjual?.min ?? 0,

      currentFilters.maxTerjual != null && currentFilters.maxTerjual !== ""
        ? Number(currentFilters.maxTerjual)
        : rangeData?.item_terjual?.max ?? 0
    ])

 }, [isOpen, rangeData])



  useEffect(() => {
    if (!isOpen) return

    apiFetch("/api/produk").then(r => {
      setProdukList(Array.isArray(r) ? r : r.data || [])
    })


    apiFetch("/api/fullname").then(r => {
      setPetugasList(r.data || [])
    })

  }, [isOpen])

  const handleApply = () => {
    const defaultHargaMin = rangeData?.harga?.min ?? 0
    const defaultHargaMax = rangeData?.harga?.max ?? 0

    const defaultItemMin = rangeData?.item_terjual?.min ?? 0
    const defaultItemMax = rangeData?.item_terjual?.max ?? 0

    const isHargaFiltered =
      hargaRange[0] !== defaultHargaMin ||
      hargaRange[1] !== defaultHargaMax

    const isItemFiltered =
      itemRange[0] !== defaultItemMin ||
      itemRange[1] !== defaultItemMax

    onApplyFilter({
      produkId,
      fullname,

      hargaMin: isHargaFiltered ? hargaRange[0] : "",
      hargaMax: isHargaFiltered ? hargaRange[1] : "",

      minTerjual: isItemFiltered ? itemRange[0] : "",
      maxTerjual: isItemFiltered ? itemRange[1] : "",

      tanggalAwal: tanggalRange?.from
        ? format(tanggalRange.from, "yyyy-MM-dd")
        : "",

      tanggalAkhir: tanggalRange?.to
        ? format(tanggalRange.to, "yyyy-MM-dd")
        : "",
    })

    onClose()
  }


  const handleReset = () => {
    setProdukId("")
    setFullname("")
    setTanggalRange(undefined)

    setHargaRange([
      rangeData?.harga?.min ?? 0,
      rangeData?.harga?.max ?? 0
    ])

    setItemRange([
      rangeData?.item_terjual?.min ?? 0,
      rangeData?.item_terjual?.max ?? 0
    ])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Laporan Pesanan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* PRODUK */}
          <SearchableDropdown
            label="Produk"
            value={produkId}
            setValue={setProdukId}
            list={produkList.map(p => ({
              label: p.nama_produk,
              value: String(p.id)
            }))}
          />

          {/* PETUGAS */}
          <SearchableDropdown
            label="Petugas"
            value={fullname}
            setValue={setFullname}
            list={petugasList.map(p => ({
              label: p.fullname,
              value: p.fullname
            }))}
          />

          {/* HARGA */}
          <div>
            <label className="text-sm font-medium">
              Range Harga ({hargaRange[0]} - {hargaRange[1]})
            </label>
            <Slider
              min={rangeData?.harga?.min ?? 0}
              max={rangeData?.harga?.max ?? 0}
              value={hargaRange}
              onValueChange={setHargaRange}
              step={1000}
              className="mt-3"
            />
          </div>

          {/* ITEM TERJUAL */}
          <div>
            <label className="text-sm font-medium">
              Item Terjual ({itemRange[0]} - {itemRange[1]})
            </label>
            <Slider
              min={rangeData?.item_terjual?.min ?? 0}
              max={rangeData?.item_terjual?.max ?? 0}
              value={itemRange}
              onValueChange={setItemRange}
              step={1}
              className="mt-3"
            />
          </div>

          {/* TANGGAL */}
          <DateRangePicker
            label="Tanggal Pesanan"
            value={tanggalRange}
            setValue={setTanggalRange}
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
          <Button variant="outline" className="w-full justify-start mt-1">
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
function SearchableDropdown({ label, value, setValue, list }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between mt-1">
            {list.find(i => i.value === value)?.label || `Pilih ${label}`}
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
                  value={item.label}
                  onSelect={() => {
                    setValue(item.value === value ? "" : item.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
