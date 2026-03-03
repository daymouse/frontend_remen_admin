import { useState, useMemo } from "react"
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
import { Button } from "@/components/ui/button"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function IngredientDropdown({
  label = "Bahan",
  value,
  setValue,
  list = [],
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredList = useMemo(() => {
    if (!search) return list
    return list.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, list])

  const selectedLabel =
    list.find((i) => String(i.id) === String(value))?.nama || ""

  return (
    <div className="min-w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between truncate"
          >
            <span className="truncate">
              {selectedLabel || `Pilih ${label}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder={`Cari ${label}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              Tidak ditemukan.
            </CommandEmpty>

            <CommandGroup className="max-h-60 overflow-auto">
              {filteredList.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.nama}
                  onSelect={() => {
                    setValue(item.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(item.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item.nama} ({item.satuan_kode})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}