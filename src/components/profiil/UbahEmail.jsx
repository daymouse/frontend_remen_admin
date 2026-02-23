import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { apiFetch } from "@/server";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ChangeEmailModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(90);
  const [resendLeft, setResendLeft] = useState(2);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [resending, setResending] = useState(false);


  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);

  const handleRequestOtp = async () => {
    if (!email) {
      setError("Email wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch("/api/profile/request-ubah-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setStep(2);
      setTimeLeft(90);
      setOtp("");
      setResendLeft(2);
      setBlockedUntil(null);
    } catch (err) {
      if (err.status === 429) {
        setError(err.message || "Permintaan diblokir sementara");
      } else {
        setError(err.message || "Gagal mengirim OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await apiFetch("/api/profile/ubah-email", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });

      if (onSuccess) onSuccess();
      resetAndClose();
    } catch (err) {
      setError(err.message || "OTP tidak valid");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

    const handleResendOtp = async () => {
    try {
        setResending(true);
        setError("");

        const res = await apiFetch("/api/profile/resend-ubah-email-otp", {
        method: "POST",
        });

        setTimeLeft(10);
        setResendLeft(res.resend_left);
    } catch (err) {
        if (err.status === 429) {
        setBlockedUntil("blocked");
        setError(err.message || "Resend diblokir sementara");
        } else {
        setError(err.message || "Gagal resend OTP");
        }
    } finally {
        setResending(false);
    }
    };


  const resetAndClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setError("");
    setTimeLeft(90);
    setResendLeft(2);
    setBlockedUntil(null);
    onClose();
  };

  const resendDisabled =
    loading || timeLeft > 0 || resendLeft <= 0 || blockedUntil;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Baru
              </Label>
              <Input
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading || blockedUntil}
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

              <Button
                variant="link"
                disabled={resendDisabled || resending}
                onClick={handleResendOtp}
                className="w-full"
                >
                {resending ? "Mengirim ulang OTP..." : `Resend OTP (${resendLeft})`}
              </Button>

            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Batal
          </Button>

          {step === 1 && (
            <Button onClick={handleRequestOtp} disabled={loading}>
              {loading ? "Mengirim OTP..." : "Next"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
