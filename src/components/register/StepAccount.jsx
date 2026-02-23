import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useMemo } from "react"
import { apiFetch } from "@/server"
import { User, Mail, Lock, InfoIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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


export default function StepAccount({ next, setUserId }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  })
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validation = useMemo(() => ({
    username: form.username.length >= 3,
    email: /\S+@\S+\.\S+/.test(form.email),
    password: form.password.length >= 6,
    confirm:
      form.password === form.confirm_password &&
      form.confirm_password !== "",
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
      username: true,
      email: true,
      password: true,
      confirm_password: true,
    })

    if (!isValid) return

    setLoading(true)
    setError("")

    try {
      const res = await apiFetch("/register/step1", {
        method: "POST",
        body: JSON.stringify(form),
      })

      setUserId(res.user_id)
      next()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Field
        icon={User}
        label="Username"
        name="username"
        placeholder="Masukkan username"
        value={form.username}
        onChange={e => handleChange("username", e.target.value)}
        onBlur={() => handleBlur("username")}
      />
      {touched.username && !validation.username && (
        <Alert>
          <AlertDescription >
            <span className="flex flex-row gap-2 items-center">
              <InfoIcon />  Minimal 3 karakter
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Field
        icon={Mail}
        label="Email"
        name="email"
        placeholder="Masukkan email"
        value={form.email}
        onChange={e => handleChange("email", e.target.value)}
        onBlur={() => handleBlur("email")}
      />
      {touched.email && !validation.email && (
        <Alert>
          <AlertDescription >
            <span className="flex flex-row gap-2 items-center">
              <InfoIcon />  Format email tidak valid
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Field
        icon={Lock}
        label="Password"
        name="password"
        type="password"
        placeholder="Masukkan password"
        value={form.password}
        onChange={e => handleChange("password", e.target.value)}
        onBlur={() => handleBlur("password")}
      />
      {touched.password && !validation.password && (
        <Alert>
          <AlertDescription >
            <span className="flex flex-row gap-2 items-center">
              <InfoIcon />  Password minimal 6 karakter
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Field
        icon={Lock}
        label="Confirm Password"
        name="confirm_password"
        type="password"
        placeholder="Ulangi password"
        value={form.confirm_password}
        onChange={e => handleChange("confirm_password", e.target.value)}
        onBlur={() => handleBlur("confirm_password")}
      />
      {touched.confirm_password && !validation.confirm && (
        <Alert>
          <AlertDescription >
            <span className="flex flex-row gap-2 items-center">
              <InfoIcon />  Password tidak sama
            </span>
          </AlertDescription>
        </Alert>
      )}

      {error && 
        <Alert>
          <AlertDescription >
            <span className="flex flex-row gap-2 items-center">
              <InfoIcon />  {error}
            </span>
          </AlertDescription>
        </Alert>
      }

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Memproses..." : "Lanjut"}
      </Button>
    </div>
  )
}
