import { useState } from "react"
import { apiFetch } from "@/server"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const StokRealForm = ({ bahan = [], onSuccess }) => {
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (bahanId, value) => {
    if (value < 0) return // cegah minus

    setForm((prev) => ({
      ...prev,
      [bahanId]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const items = Object.entries(form)
      .filter(([_, value]) => value !== "" && value !== undefined)
      .map(([key, value]) => ({
        bahan_id: Number(key),
        stok_real: Number(value)
      }))

    if (!items.length) {
      setMessage({ type: "error", text: "Minimal isi satu stok real" })
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)

      const res = await apiFetch("/api/laporan/stok/admin", {
        method: "POST",
        body: JSON.stringify({ items })
      })

      if (res?.status === "APPROVED") {
        setMessage({ type: "success", text: "Laporan berhasil diproses" })
        setForm({})
        onSuccess?.()
      } else {
        setMessage({ type: "error", text: "Laporan gagal diproses" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal mengirim laporan" })
    } finally {
      setSubmitting(false)
    }
  }

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0"

    const number = Number(value)

    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: number % 1 === 0 ? 0 : 3
    }).format(number)
  }

  if (!bahan.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Tidak ada data bahan baku
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        {bahan.map((item) => (
          <div key={item.id}>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 justify-between">
              <div className="font-medium flex-1 border rounded-3xl py-2 px-4 mb-2 md:mb-0">
                {item.nama}
              </div>
              <div className="flex flex-row gap-2 flex-1 justify-between items-center">
                <div className="flex-1 relative">
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        className="pr-10 rounded-3xl"
                        value={form[item.id] ?? ""}
                        onChange={(e) =>
                        handleChange(item.id, e.target.value)
                        }
                        disabled={submitting}
                    />

                    {item.satuan_kode && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {item.satuan_kode}
                        </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {message && (
        <div
          className={`text-sm ${
            message.type === "error"
              ? "text-red-500"
              : "text-green-600"
          }`}
        >
          {message.text}
        </div>
      )}
      <Button
        type="submit"
        disabled={submitting}
        className="rounded-2xl "
      >
        {submitting ? "Memproses..." : "Kirim Laporan"}
      </Button>
    </form>
  )
}

export default StokRealForm