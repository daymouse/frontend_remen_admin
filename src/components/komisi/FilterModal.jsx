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
import { Input } from "@/components/ui/input";

export default function FilterModal({ open, onClose, onApply, ranges }) {
  const [namaList, setNamaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  const [cupMin, setCupMin] = useState("");
  const [cupMax, setCupMax] = useState("");

  const [transMin, setTransMin] = useState("");
  const [transMax, setTransMax] = useState("");

  const [bonusMin, setBonusMin] = useState("");
  const [bonusMax, setBonusMax] = useState("");

  const [komisiMin, setKomisiMin] = useState("");
  const [komisiMax, setKomisiMax] = useState("");

  const [bayarMin, setBayarMin] = useState("");
  const [bayarMax, setBayarMax] = useState("");

  useEffect(() => {
    if (!open) return;
    if (namaList.length && kelasList.length) return;

    apiFetch("/api/fullname").then(r => setNamaList(r.data || []));
    apiFetch("/api/kelas").then(r => setKelasList(r.data || []));
  }, [open]);

  const handleApply = () => {
    onApply({
      nama,
      kelas,

      cup_min: cupMin || null,
      cup_max: cupMax || null,

      transaksi_min: transMin || null,
      transaksi_max: transMax || null,

      bonus_min: bonusMin || null,
      bonus_max: bonusMax || null,

      komisi_min: komisiMin || null,
      komisi_max: komisiMax || null,

      bayar_min: bayarMin || null,
      bayar_max: bayarMax || null,
    });

    onClose();
  };

  const handleReset = () => {
    setNama("");
    setKelas("");

    setCupMin("");
    setCupMax("");
    setTransMin("");
    setTransMax("");
    setBonusMin("");
    setBonusMax("");
    setKomisiMin("");
    setKomisiMax("");
    setBayarMin("");
    setBayarMax("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full 
  max-h-[90vh] 
  overflow-y-auto 
  px-4 sm:px-6 
  pb-24">
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

          <RangeInput
            label="Total Cup"
            minValue={cupMin}
            maxValue={cupMax}
            setMin={setCupMin}
            setMax={setCupMax}
          />

          <RangeInput
            label="Total Transaksi"
            minValue={transMin}
            maxValue={transMax}
            setMin={setTransMin}
            setMax={setTransMax}
            isCurrency
          />

          <RangeInput
            label="Total Komisi"
            minValue={komisiMin}
            maxValue={komisiMax}
            setMin={setKomisiMin}
            setMax={setKomisiMax}
            isCurrency
          />

          <RangeInput
            label="Total Bonus"
            minValue={bonusMin}
            maxValue={bonusMax}
            setMin={setBonusMin}
            setMax={setBonusMax}
            isCurrency
          />

          <RangeInput
            label="Total Bayar"
            minValue={bayarMin}
            maxValue={bayarMax}
            setMin={setBayarMin}
            setMax={setBayarMax}
            isCurrency
          />
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

function RangeInput({
  label,
  minValue,
  maxValue,
  setMin,
  setMax,
  isCurrency = false,
}) {

  const [error, setError] = useState("");
  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(number);
  };

const handleMinChange = (e) => {
  const raw = e.target.value.replace(/\D/g, "");

  // set min
  setMin(raw);

  // kalau max kosong → samakan
  if (!maxValue) {
    setMax(raw);
  }

  // kalau max lebih kecil dari min → samakan
  if (maxValue && Number(raw) > Number(maxValue)) {
    setMax(raw);
  }
};

const handleMaxChange = (e) => {
  const raw = e.target.value.replace(/\D/g, "");

  // Izinkan kosong sementara (supaya bisa edit)
  setMax(raw);

  if (raw === "") {
    setError("");
    return;
  }

  if (minValue && Number(raw) < Number(minValue)) {
    setError("Max tidak boleh lebih kecil dari Min");
  } else {
    setError("");
  }
};
const handleMaxBlur = () => {
  // Kalau kosong → samakan dengan min
  if (!maxValue && minValue) {
    setMax(minValue);
    setError("");
    return;
  }

  // Kalau lebih kecil dari min → paksa samakan min
  if (minValue && Number(maxValue) < Number(minValue)) {
    setMax(minValue);
    setError("");
  }
};
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      
      {/* Label */}
      <div className="w-full sm:w-44">
        <label className="text-sm sm:text-base font-medium">
          {label}
        </label>
        
      </div>

    <div className="flex-1 flex flex-col gap-2">
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="flex flex-row sm:flex-row gap-3 w-full">
          
          {/* MIN */}
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Min</span>
            <div className="relative">
              {isCurrency && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
              )}
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={isCurrency ? formatRupiah(minValue) : minValue}
                onChange={handleMinChange}
                className={`h-9 sm:h-10 text-sm ${
                  isCurrency ? "pl-9" : ""
                }`}
              />
            </div>
          </div>

          {/* MAX */}
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Max</span>
            <div className="relative">
              {isCurrency && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
              )}
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={isCurrency ? formatRupiah(maxValue) : maxValue}
                onChange={handleMaxChange}
                onBlur={handleMaxBlur}
                className={`h-9 sm:h-10 text-sm ${isCurrency ? "pl-9" : ""}`}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
