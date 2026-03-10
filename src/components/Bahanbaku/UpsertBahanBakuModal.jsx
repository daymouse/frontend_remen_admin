import { useState, useEffect, useMemo } from "react"
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
import { InfoIcon, Package, Layers } from "lucide-react"
import { apiFetch } from "@/server"

const Field = ({
  icon: Icon,
  label,
  children,
}) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4" />
      {label}
    </Label>
    {children}
  </div>
)

export default function UpsertBahanBakuModal({
  open,
  onClose,
  item,
  onSave,
}) {
  const isEdit = !!item

  const [formData, setFormData] = useState({
    nama: "",
    tipe: "",
    minimal_stok: "",
    satuan_id: "",
  })

  const [touched, setTouched] = useState({})
  const [error, setError] = useState("")
  const [satuanList, setSatuanList] = useState([])

  useEffect(() => {
    if (item) {
      setFormData({
        nama: item.nama || "",
        tipe: item.tipe || "",
        minimal_stok: item.minimal_stok || "",
        satuan_id: item.satuan_id || "",
      })
    } else {
      setFormData({
        nama: "",
        tipe: "",
        minimal_stok: "",
        satuan_id: "",
      })
    }
  }, [item])

  useEffect(() => {
    if (!open) return

    const fetchSatuan = async () => {
      try {
        const response = await apiFetch("/auth/satuan")
        if (response.success) {
          setSatuanList(response.data)
        }
      } catch (err) {
        console.error("Gagal fetch satuan", err)
      }
    }

    fetchSatuan()
  }, [open])

  const validation = useMemo(() => ({
    nama: formData.nama.trim().length >= 3,
    tipe: !!formData.tipe,
    satuan_id: !!formData.satuan_id,
    minimal_stok:
      formData.minimal_stok !== "" &&
      Number(formData.minimal_stok) >= 0,
  }), [formData])

  const isValid = Object.values(validation).every(Boolean)

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }))
  }

   const formatNumber = (value) => {
    if (!value) return "0"

    const number = parseFloat(value)
    if (number % 1 === 0) {
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
      }).format(number)
    }
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 3,
    }).format(number)
  }

  const resetForm = () => {
    setFormData({
        nama: "",
        tipe: "",
        minimal_stok: "",
        satuan_id: "",
    })
    setTouched({})
    setError("")
    }

    const handleSubmit = async () => {
        setTouched({
            nama: true,
            tipe: true,
            satuan_id: true,
            minimal_stok: true,
        })

        if (!isValid) return

        await onSave(item?.id ?? null, formData)

        resetForm()
        onClose()
    }

    useEffect(() => {
  if (!open) {
    resetForm()
  }
}, [open])
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="
        sm:max-w-md
        max-h-[90dvh]
        overflow-y-auto
        pb-32 md:pb-10
        ">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Nama */}
          <Field icon={Package} label="Nama Bahan">
            <Input
              placeholder="Masukkan nama bahan"
              value={formData.nama}
              onChange={(e) =>
                handleChange("nama", e.target.value)
              }
              onBlur={() => handleBlur("nama")}
            />
          </Field>
          {touched.nama && !validation.nama && (
            <Alert>
              <AlertDescription>
                <span className="flex items-center gap-2">
                  <InfoIcon /> Minimal 3 karakter
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Field icon={Layers} label="Tipe">
                <Select
                  value={formData.tipe}
                  onValueChange={(val) =>
                    handleChange("tipe", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produksi">
                      Produksi
                    </SelectItem>
                    <SelectItem value="operasional">
                      Operasional
                    </SelectItem>
                    <SelectItem value="packaging">
                      Packaging
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex-1">
              <Field icon={Layers} label="Satuan">
                <Select
                  value={formData.satuan_id}
                  onValueChange={(val) =>
                    handleChange("satuan_id", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {satuanList.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={String(s.id)}
                      >
                        {s.kode} ({s.tipe})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          {(touched.tipe && !validation.tipe) ||
          (touched.satuan_id && !validation.satuan_id) ? (
            <Alert>
              <AlertDescription>
                <span className="flex items-center gap-2">
                  <InfoIcon /> Tipe dan Satuan wajib dipilih
                </span>
              </AlertDescription>
            </Alert>
          ) : null}

          <Field icon={Package} label="Minimal Stok">
            <Input
              type="number"
              placeholder="Masukkan minimal stok"
              value={formatNumber(formData.minimal_stok)}
              onChange={(e) =>
                handleChange("minimal_stok", e.target.value)
              }
              onBlur={() => handleBlur("minimal_stok")}
            />
          </Field>
          {touched.minimal_stok &&
            !validation.minimal_stok && (
              <Alert>
                <AlertDescription>
                  <span className="flex items-center gap-2">
                    <InfoIcon /> Minimal stok harus ≥ 0
                  </span>
                </AlertDescription>
              </Alert>
            )}

        </div>

        <DialogFooter className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            onClick={handleSubmit}
          >
            {isEdit ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}