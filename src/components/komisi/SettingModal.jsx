import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function KomisiModal({
  open,
  onClose,
  onSubmit,
  defaultValue,
}) {
  const [originalData, setOriginalData] = useState(null)
  const [mode, setMode] = useState("view") 
  const [tipe, setTipe] = useState("")
  const [nilai, setNilai] = useState("")
  const [error, setError] = useState(null)


  useEffect(() => {
    if (!open) return

    if (defaultValue) {
      const data = {
        tipe: defaultValue.tipe ?? "",
        nilai: defaultValue.nilai
          ? parseFloat(defaultValue.nilai)
          : ""
      }

      setOriginalData(data)
      setTipe(data.tipe)
      setNilai(data.nilai)
    }

    setMode("view")
  }, [open, defaultValue])

  const handleSubmit = async () => {
    if (!tipe || !nilai) return

    setError(null)

    try {
      await onSubmit({
        tipe,
        nilai: Number(nilai),
      })
      setMode("view")
    } catch (err) {
      if (err?.messages) {
        setError(err.messages)
      } else {
        setError({ general: err.message || "Terjadi kesalahan" })
      }
    }
  }

  const handleCancelEdit = () => {
    if (originalData) {
      setTipe(originalData.tipe)
      setNilai(originalData.nilai)
    }
    setMode("view")
  }

  useEffect(() => {
    if (!open) return
    setError(null)
  }, [open, mode])


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Komisi </DialogTitle>
          <DialogDescription>
            Atur tipe dan nilai komisi yang berlaku untuk petugas.
          </DialogDescription>
        </DialogHeader>
        {mode === "view" && (
          <div className="space-y-3">
            <div>
              <Label>Tipe Komisi</Label>
              <p className="font-medium capitalize">{tipe || "-"}</p>
            </div>

            <div>
              <Label>Nilai Komisi</Label>
              <p className="font-medium">
                {tipe === "item"
                  ? `Rp ${Number(nilai).toLocaleString("id-ID")}`
                  : `${nilai}%`}
              </p>
            </div>

            {tipe && (
              <Alert>
                <AlertDescription>
                  {tipe === "item" ? (
                    <>
                      Komisi dihitung <b>per jumlah cup</b>.
                    </>
                  ) : (
                    <>
                      Komisi dihitung dari <b>total transaksi</b>.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
              <Button onClick={() => setMode("edit")}>
                Edit
              </Button>
            </DialogFooter>
          </div>
        )}
        {mode === "edit" && (
          <div className="space-y-4">
            {/* TIPE */}
            <div className="space-y-2">
              <Label>Tipe Komisi</Label>
              <ToggleGroup
                type="single"
                value={tipe}
                onValueChange={setTipe}
              >
                <ToggleGroupItem value="item">Per Item</ToggleGroupItem>
                <ToggleGroupItem value="persen">Persen</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* NILAI */}
            <div className="space-y-2">
              <Label>
                Nilai Komisi {tipe === "item" && "(Rp)"}{" "}
                {tipe === "persen" && "(%)"}
              </Label>
              {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {typeof error === "string" ? (
                    error
                  ) : (
                    <ul className="list-disc pl-4 space-y-1">
                      {Object.values(error).map((msg, i) => (
                        <li key={i}>OOPS!! {msg}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

              <Input
                type="number"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                disabled={!tipe}
              />
            </div>

            {/* INFO */}
            {tipe && (
              <Alert>
                <AlertDescription>
                  {tipe === "item" ? (
                    <>
                      Komisi dihitung <b>per jumlah cup</b>.  
                      Contoh: Rp {nilai || 0} × jumlah cup.
                    </>
                  ) : (
                    <>
                      Komisi dihitung dari <b>total transaksi</b>.  
                      Contoh: {nilai || 0}% × total pembayaran.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                 onClick={handleCancelEdit}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!tipe || !nilai}
              >
                Simpan
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
