import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Loader2  } from "lucide-react"
import { apiFetch } from "@/server"
import { useNavigate } from "react-router-dom"

export default function StepOtp({ userId }) {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(180)
  const [locked, setLocked] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)


  const timerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (otp.length === 6) verifyOtp()
  }, [otp])

  const verifyOtp = async () => {
    setLoading(true)
    try {
      await apiFetch("/register/verifyOtp", {
        method: "POST",
        throwWithData: true,
        body: JSON.stringify({ user_id: userId, otp }),
      })

      navigate("/login", {
        state: { message: "Registrasi berhasil, silakan login" },
      })
    } catch (e) {
      const data = e.data || {}

      if (data.blocked) {
        setBlocked(true)
        return
      }

      if (data.locked) {
        setLocked(true)
      }

      if (data.expired) {
        setTimeLeft(0)
      }

      setOtp("")
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResendLoading(true)
    try {
      await apiFetch("/register/resendOtp", {
        method: "POST",
        throwWithData: true,
        body: JSON.stringify({ user_id: userId }),
      })

      clearInterval(timerRef.current)
      setTimeLeft(180)
      setLocked(false)
      setBlocked(false)
      setOtp("")
    } catch (e) {
      const data = e.data || {}
      if (data.blocked) {
        setBlocked(true)
      }
    } finally {
      setResendLoading(false)
    }
  }


  useEffect(() => {
    if (locked || blocked) {
      setTimeLeft(0)
      clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [locked, blocked])

  return (
    <div className="space-y-4">
      {/* INFO RULES */}
      <Alert>
        <AlertDescription>
          <span className="flex gap-2 items-start text-sm">
            <InfoIcon className="w-4 h-4 mt-1" />
            <span>
              Maksimal <b>5 kali</b> salah OTP dan <b>3 kali</b> kirim ulang.
              Jika melebihi, akun akan <b>diblokir permanen</b>.
            </span>
          </span>
        </AlertDescription>
      </Alert>

      {blocked && (
        <Alert variant="destructive">
          <AlertDescription>
            Akun Anda telah diblokir permanen. Silakan hubungi admin.
          </AlertDescription>
        </Alert>
      )}

      {locked && !blocked && (
        <Alert variant="destructive">
          <AlertDescription>
            Terlalu banyak percobaan OTP. Silakan kirim ulang OTP.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={blocked || loading || timeLeft === 0}
        >
          <InputOTPGroup>
            {[...Array(6)].map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <p className="text-sm text-center text-muted-foreground">
        {timeLeft > 0
          ? `OTP kadaluarsa dalam ${timeLeft} detik`
          : "OTP kadaluarsa"}
      </p>
      {!blocked && (timeLeft === 0 || locked) && (
        <Button
          variant="outline"
          onClick={resend}
          className="w-full"
          disabled={resendLoading}
        >
          {resendLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Kirim Ulang OTP
        </Button>
      )}

    </div>
  )
}
