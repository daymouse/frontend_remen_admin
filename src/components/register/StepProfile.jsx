import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, InfoIcon, Phone, BadgeInfo } from "lucide-react"
import { apiFetch } from "@/server"

const Field = ({ icon: Icon, label, name, type = "text", placeholder, value, onChange, onBlur }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4" />
      {label}
    </Label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  </div>
)

export default function StepProfile({ userId, next }) {
  const [form, setForm] = useState({
    fullname: "",
    nickname: "",
    kelas: "",
    no_wa: "",
  })

  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const validation = useMemo(() => ({
    fullname: form.fullname.trim().length >= 3,
    nickname: /^[^\s]+$/.test(form.nickname), 
    kelas: true,
    no_wa: /^(08|628)\d{8,13}$/.test(form.no_wa),
  }), [form])

  const isValid = Object.values(validation).every(Boolean)

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleBlur = (key) => {
    setTouched(prev => ({ ...prev, [key]: true }))
  }

  const submit = async () => {
    setTouched({
      fullname: true,
      nickname: true,
      kelas: true,
      no_wa: true,
    })

    if (!isValid) return

    setLoading(true)

    await apiFetch("/register/step2", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        user_id: userId,
      }),
    })

    setLoading(false)
    next()
  }

  return (
    <div className="space-y-4">
      <Field
        icon={User}
        label="Fullname"
        name="fullname"
        placeholder="Masukkan nama lengkap"
        value={form.fullname}
        onChange={e => handleChange("fullname", e.target.value)}
        onBlur={() => handleBlur("fullname")}
      />
      {touched.fullname && !validation.fullname && (
        <Alert>
          <AlertDescription>
            <span className="flex items-center gap-2">
              <InfoIcon /> Minimal 3 karakter
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Field
        icon={BadgeInfo}
        label="Nickname"
        name="nickname"
        placeholder="Satu kata tanpa spasi"
        value={form.nickname}
        onChange={e => handleChange("nickname", e.target.value)}
        onBlur={() => handleBlur("nickname")}
      />
      {touched.nickname && !validation.nickname && (
        <Alert>
          <AlertDescription>
            <span className="flex items-center gap-2">
              <InfoIcon /> Nickname hanya boleh satu kata
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Field
        icon={BadgeInfo}
        label="Kelas"
        name="kelas"
        placeholder="Contoh: XII RPL 1"
        value={form.kelas}
        onChange={e => handleChange("kelas", e.target.value)}
        onBlur={() => handleBlur("kelas")}
      />

      <Field
        icon={Phone}
        label="No WhatsApp"
        name="no_wa"
        placeholder="08xxxx atau 628xxx"
        value={form.no_wa}
        onChange={e => handleChange("no_wa", e.target.value)}
        onBlur={() => handleBlur("no_wa")}
      />
      {touched.no_wa && !validation.no_wa && (
        <Alert>
          <AlertDescription>
            <span className="flex items-center gap-2">
              <InfoIcon /> Nomor WA tidak valid (08 / 628, 10-15 digit)
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Mengirim...
          </span>
        ) : (
          "Kirim & Kirim OTP"
        )}
      </Button>
    </div>
  )
}
