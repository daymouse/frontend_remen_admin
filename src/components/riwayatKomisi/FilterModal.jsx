import { useEffect, useState } from "react";
import { apiFetch } from "@/server";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FilterModal({ open, onClose, onApply, ranges }) {
  const [namaList, setNamaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [bonus, setBonus] = useState([0, 0]);
  const [komisi, setkomisi] = useState([0, 0]);
  const [bayar, setBayar] = useState([0, 0]);

  useEffect(() => {
    if (!open) return;
    if (namaList.length && kelasList.length) return;

    apiFetch("/api/fullname").then(r => setNamaList(r.data || []));
    apiFetch("/api/kelas").then(r => setKelasList(r.data || []));
  }, [open]);


  useEffect(() => {
    if (!ranges) return;
    setkomisi([ranges.total_komisi.min, ranges.total_komisi.max]);
    setBonus([ranges.total_bonus.min, ranges.total_bonus.max]);
    setBayar([ranges.total_bayar.min, ranges.total_bayar.max]);
  }, [ranges]);

  const handleApply = () => {
    onApply({ nama, kelas, bonus, komisi, bayar });
    onClose();
  };

  const handleReset = () => {
    setNama("");
    setKelas("");
    if (!ranges) return;
    setkomisi([ranges.total_komisi.min, ranges.total_komisi.max]);
    setBonus([ranges.total_bonus.min, ranges.total_bonus.max]);
    setBayar([ranges.total_bayar.min, ranges.total_bayar.max]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Filter Komisi Petugas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          <SearchableDropdown
            label="Nama Petugas"
            value={nama}
            setValue={setNama}
            list={namaList.map(n => n.fullname)}
          />

          <SearchableDropdown
            label="Kelas"
            value={kelas}
            setValue={setKelas}
            list={kelasList.map(k => k.kelas)}
          />

            <RangeSlider label="Total Komisi" value={komisi} setValue={setkomisi} min={ranges?.total_komisi.min} max={ranges?.total_komisi.max} />
            <RangeSlider label="Total Bonus" value={bonus} setValue={setBonus} min={ranges?.total_bonus.min} max={ranges?.total_bonus.max} />
            <RangeSlider label="Total Bayar" value={bayar} setValue={setBayar} min={ranges?.total_bayar.min} max={ranges?.total_bayar.max} />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleReset}>Reset</Button>
            <Button onClick={handleApply}>Terapkan</Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchableDropdown({ label, value, setValue, list }) {
  const [open, setOpen] = useState(false);

  return (
    <div >
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between mt-1"
          >
            {value || `Pilih ${label}`}
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
                    setValue(current === value ? "" : current);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item ? "opacity-100" : "opacity-0"
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
  );
}

function RangeSlider({ label, value, setValue, min, max }) {
  if (min === undefined || max === undefined) return null;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value[0]} — {value[1]}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}
