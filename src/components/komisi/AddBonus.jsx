import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function AddBonusModal({ isOpen, onClose, onSubmit }) {
  const [nominal, setNominal] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)

    const handleNominalChange = (e) => {
        const value = e.target.value.replace(/\D/g, "")
        setNominal(value)
    }

    const handleSubmit = async () => {
        const numericNominal = Number(nominal)

        if (numericNominal <= 0) {
            alert("Nominal harus lebih dari 0")
            return
        }

        setIsLoading(true)
        try {
            await onSubmit({
            nominal: numericNominal,
            keterangan: keterangan.trim(),
            })
            setNominal("")
            setKeterangan("")
            onClose()
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Tambah Bonus</DialogTitle>
          <DialogDescription>
            Bonus akan diberikan ke petugas terpilih
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Nominal Bonus</Label>
            <Input
                value={nominal ? formatRupiah(Number(nominal)) : ""}
                onChange={handleNominalChange}
                inputMode="numeric"
                placeholder="Rp 0"
            />

          </div>
          <div className="grid gap-2">
            <Label>Keterangan</Label>
            <Textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              maxLength={300}
            />
            <span className="text-xs text-muted-foreground text-right">
              {keterangan.length}/300
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || nominal <= 0}
          >
            {isLoading ? "Menyimpan..." : "Tambah Bonus"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
