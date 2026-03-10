import { useState } from "react"
import { Button } from "@/components/ui/button"

const RejectModal = ({ open, onClose, onSubmit, item }) => {
  const [reason, setReason] = useState("")

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">
          Reject Laporan
        </h2>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Masukkan alasan reject..."
          className="w-full border rounded-md p-2 text-sm"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setReason("")
              onClose()
            }}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              if (!reason.trim()) return
              onSubmit(reason)
              setReason("")
            }}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RejectModal