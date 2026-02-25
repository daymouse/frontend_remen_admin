import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const InvoiceModal = ({ open, onClose, order, formatCurrency }) => {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Remen Coffee
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Laporan Pesanan Berhasil
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pesanan telah berhasil dilaporkan</p>
            <p className="text-sm text-muted-foreground">
              ID: {order.pesanan_id}
            </p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.nama_produk}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.quantity} × {formatCurrency(item.finalPrice)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.finalPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-green-600">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default InvoiceModal