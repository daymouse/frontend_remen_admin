import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const DetailPesananModal = ({
  isOpen,
  onClose,
  data,
  formatCurrency,
  formatDate
}) => {
  if (!data) return null

  const petugasName =
    data.petugas?.fullname ||
    data.petugas?.username ||
    "Petugas"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95vw] 
          max-w-xl 
          max-h-[90vh] 
          overflow-y-auto 
          p-0
        "
      >
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-3">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            ID Pesanan {data.id}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {formatDate(data.created_at)}
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-6 space-y-5">

          {/* Petugas */}
          <Card className="p-4 flex items-center gap-3 shadow-none">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
              {petugasName.charAt(0)}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {petugasName}
              </span>
              <span className="text-xs text-muted-foreground">
                Petugas
              </span>
            </div>
          </Card>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Item Pesanan
              </h3>
              <Badge variant="secondary" className="text-xs">
                {data.items?.length || 0} produk
              </Badge>
            </div>

            <div className="space-y-3">
              {data.items?.map((item, index) => (
                <Card
                  key={index}
                  className="p-4 shadow-none"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    
                    <div>
                      <p className="text-sm font-medium">
                        {item.produk?.nama_produk || "Produk"}
                      </p>

                      <div className="text-xs text-muted-foreground">
                        {item.jumlah} × {formatCurrency(item.harga_satuan)}
                      </div>
                    </div>

                    <div className="text-sm font-semibold sm:text-right">
                      {formatCurrency(item.subtotal)}
                    </div>

                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">
              Total Pembayaran
            </span>
            <span className="text-lg sm:text-xl font-bold">
              {formatCurrency(data.total_harga)}
            </span>
          </div>

          {/* Action */}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Tutup
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DetailPesananModal
