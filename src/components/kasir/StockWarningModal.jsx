import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

const StockWarningModal = ({ open, warnings, onContinue }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-5 h-5" />
            Peringatan Stok
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
          {warnings?.map((warn, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm font-medium ${
                warn.type === "minus"
                  ? "bg-red-100 text-red-700"
                  : warn.type === "habis"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {warn.message}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={onContinue}>
            Lanjutkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StockWarningModal