import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { apiFetch } from "@/server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [form, setForm] = useState({
    password: "",
    password_confirm: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.password || !form.password_confirm) {
      setError("Password wajib diisi")
      return
    }

    if (form.password !== form.password_confirm) {
      setError("Konfirmasi password tidak sama")
      return
    }

    try {
      setLoading(true)
      setError("")

      await apiFetch("/api/profile/update-password-token", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: form.password,
          password_confirm: form.password_confirm,
        }),
      })

      setSuccess(true)
    } catch (err) {
      setError(err.message || "Token tidak valid atau sudah kadaluarsa")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return <p className="text-center mt-10 text-red-500">Token tidak valid</p>
  }

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {success ? (
            <p className="text-green-600">
              Password berhasil direset. Silakan login kembali.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Menyimpan..." : "Reset Password"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
