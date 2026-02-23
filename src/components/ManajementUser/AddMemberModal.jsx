import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, Phone, BadgeInfo, InfoIcon } from "lucide-react"
import { apiFetch } from "@/server"
import Stepper from "@/components/ManajementUser/Stepper"

const Field = ({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) => (
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
    />
  </div>
)

export default function AddMemberModal({ isOpen, onClose, onSuccess }) {

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState({})

  const [account, setAccount] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  const [profile, setProfile] = useState({
    fullname: "",
    nickname: "",
    kelas: "",
    no_wa: "",
  })

  /* ================= VALIDATION STEP 1 ================= */

  const accountValidation = useMemo(() => ({
    username: account.username.length >= 3,
    email: /\S+@\S+\.\S+/.test(account.email),
    password: account.password.length >= 6,
    confirm:
      account.password === account.confirm_password &&
      account.confirm_password !== "",
  }), [account])

  const isAccountValid = Object.values(accountValidation).every(Boolean)

  /* ================= VALIDATION STEP 2 ================= */

  const profileValidation = useMemo(() => ({
    fullname: profile.fullname.trim().length >= 3,
    nickname: /^[^\s]+$/.test(profile.nickname),
    no_wa: /^(08|628)\d{8,13}$/.test(profile.no_wa),
  }), [profile])

  const isProfileValid = Object.values(profileValidation).every(Boolean)

  /* ================= HANDLERS ================= */

  const handleAccountChange = (key, value) => {
    setAccount(prev => ({ ...prev, [key]: value }))
  }

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    setTouched({
      username: true,
      email: true,
      password: true,
      confirm_password: true,
    })

    if (!isAccountValid) return
    setStep(2)
  }

  const submitAll = async () => {
    setTouched({
      fullname: true,
      nickname: true,
      no_wa: true,
    })

    if (!isProfileValid) return

    setLoading(true)
    setError("")

    try {
      await apiFetch("/api/manajement-user/add-user", {
        method: "POST",
        body: JSON.stringify({
          ...account,
          ...profile,
        }),
      })

      onSuccess("Petugas berhasil ditambahkan")
      resetState()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setStep(1)
    setAccount({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    })
    setProfile({
      fullname: "",
      nickname: "",
      kelas: "",
      no_wa: "",
    })
    setTouched({})
    setError("")
  }

  /* ================= UI ================= */

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetState(); onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Informasi Akun" : "Data Petugas"}
          </DialogTitle>
        </DialogHeader>

        <Stepper
          step={step - 1}
          steps={["Akun", "Data Diri"]}
        />

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <Field
                icon={User}
                label="Username"
                placeholder="Minimal 3 karakter"
                value={account.username}
                onChange={e => handleAccountChange("username", e.target.value)}
              />

              {touched.username && !accountValidation.username && (
                <Alert>
                  <AlertDescription className="flex gap-2">
                    <InfoIcon className="w-4 h-4" />
                    Username minimal 3 karakter
                  </AlertDescription>
                </Alert>
              )}

              <Field
                icon={Mail}
                label="Email"
                placeholder="Format email valid"
                value={account.email}
                onChange={e => handleAccountChange("email", e.target.value)}
              />

              {touched.email && !accountValidation.email && (
                <Alert>
                  <AlertDescription className="flex gap-2">
                    <InfoIcon className="w-4 h-4" />
                    Format email tidak valid
                  </AlertDescription>
                </Alert>
              )}

              <Field
                icon={Lock}
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={account.password}
                onChange={e => handleAccountChange("password", e.target.value)}
              />

              {touched.password && !accountValidation.password && (
                <Alert>
                  <AlertDescription className="flex gap-2">
                    <InfoIcon className="w-4 h-4" />
                    Password minimal 6 karakter
                  </AlertDescription>
                </Alert>
              )}

              <Field
                icon={Lock}
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                value={account.confirm_password}
                onChange={e => handleAccountChange("confirm_password", e.target.value)}
              />

              {touched.confirm_password && !accountValidation.confirm && (
                <Alert>
                  <AlertDescription className="flex gap-2">
                    <InfoIcon className="w-4 h-4" />
                    Konfirmasi password tidak sama
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <>
              <Field
                icon={User}
                label="Fullname"
                value={profile.fullname}
                onChange={e => handleProfileChange("fullname", e.target.value)}
              />

              <Field
                icon={BadgeInfo}
                label="Nickname"
                placeholder="Satu kata"
                value={profile.nickname}
                onChange={e => handleProfileChange("nickname", e.target.value)}
              />

              <Field
                icon={BadgeInfo}
                label="Kelas"
                value={profile.kelas}
                onChange={e => handleProfileChange("kelas", e.target.value)}
              />

              <Field
                icon={Phone}
                label="No WhatsApp"
                placeholder="08xxxx / 628xxx"
                value={profile.no_wa}
                onChange={e => handleProfileChange("no_wa", e.target.value)}
              />
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* STICKY BUTTON AREA */}
        {/* STICKY BUTTON AREA */}
<div className="pt-4 border-t mt-4 w-full">
  {step === 1 ? (
    <Button
      className="w-full"
      disabled={loading}
      onClick={nextStep}
    >
      Lanjut
    </Button>
  ) : (
    <div className="flex w-full gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => setStep(1)}
      >
        Kembali
      </Button>

      <Button
        type="button"
        className="flex-1"
        disabled={loading}
        onClick={submitAll}
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </Button>
    </div>
  )}
</div>


      </DialogContent>
    </Dialog>
  )
}
