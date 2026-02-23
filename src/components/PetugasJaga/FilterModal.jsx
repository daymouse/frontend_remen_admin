import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UserSearch from "./UserSearch"

export default function FilterModal({ open, onClose, onApply }) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (startDate) {
      setEndDate(startDate)
    } else {
      setEndDate("")
    }
  }, [startDate])

  const isValid =
    (user && !startDate && !endDate) ||
    (startDate && endDate && !user) ||
    (startDate && endDate && user)

  const handleApply = () => {
    if (!isValid) return

    onApply({
      startDate: startDate || null,
      endDate: endDate || null,
      user: user || null,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Data Jaga</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tanggal Awal */}
          <div>
            <label className="text-sm font-medium">Tanggal Awal</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!startDate} 
            />
          </div>

          <UserSearch open={open} value={user} onChange={setUser} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>

          <Button
            disabled={!isValid}
            onClick={handleApply}
          >
            Terapkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
