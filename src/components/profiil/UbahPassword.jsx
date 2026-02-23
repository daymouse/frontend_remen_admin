import { useState, useMemo  } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Key, InfoIcon } from "lucide-react";
import { apiFetch } from "@/server";
import { Alert, AlertDescription } from "@/components/ui/alert"

const Field = ({ icon: Icon, label, name, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4" />
      {label}
    </Label>
    <Input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });



  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword" || name === "confirmPassword") {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };


  const validation = useMemo(() => ({
    password: form.newPassword.length >= 6,
    confirm:
      form.newPassword === form.confirmPassword &&
      form.confirmPassword !== "",
  }), [form]);


  const isValid = Object.values(validation).every(Boolean)

  const handleNext = async () => {
    if (!form.oldPassword) {
      setError("Masukkan password lama");
      return;
    }

    try {
      setError("");
      setLoadingNext(true);

      await apiFetch("/api/admin/verify-password", {
        method: "POST",
        body: JSON.stringify({
          passwordLama: form.oldPassword,
        }),
      });

      setStep(2);
    } catch (err) {
      setError(err.message || "Password lama salah");
    } finally {
      setLoadingNext(false);
    }
  };




  const handleSave = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      setError("Isi semua field password baru");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Password baru dan konfirmasi tidak sama");
      return;
    }

    try {
      setLoadingSave(true);

      await apiFetch("/api/profile/update-password", {
        method: "PUT",
        body: JSON.stringify({
          passwordNew: form.newPassword,
          passwordNewConfirm: form.confirmPassword,
        }),
      });

      alert("Password berhasil diperbarui");
      onClose();
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleForgot = async () => {
    try {
      setError("");
      setLoadingToken(true);

      await apiFetch("/api/profile/token-reset-password", {
        method: "POST",
      });

      alert("Link reset password telah dikirim ke email Anda");
    } catch (err) {
      setError(err.message || "Gagal mengirim link reset password");
    } finally {
      setLoadingToken(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4">
          {step === 1 && (
            <>
              <Field
                icon={Lock}
                label="Password Lama"
                name="oldPassword"
                type="password"
                placeholder="Masukkan password lama"
                value={form.oldPassword}
                onChange={handleChange}
              />
              <Button
                variant="link"
                size="sm"
                onClick={handleForgot}
                disabled={loadingToken}
              >
                {loadingToken ? "Mengirim link..." : "Lupa password?"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <Field
                icon={Key}
                label="Password Baru"
                name="newPassword"
                type="password"
                placeholder="Masukkan password baru"
                value={form.newPassword}
                onChange={handleChange}
              />
              {touched.newPassword && !validation.password && (
                <Alert>
                  <AlertDescription >
                    <span className="flex flex-row gap-2 items-center">
                      <InfoIcon />  Password minimal 6 karakter
                    </span>
                  </AlertDescription>
                </Alert>
              )}
              <Field
                icon={Key}
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                placeholder="Konfirmasi password baru"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {touched.confirmPassword && !validation.confirm && (
                <Alert>
                  <AlertDescription >
                    <span className="flex flex-row gap-2 items-center">
                      <InfoIcon />  Password tidak sama
                    </span>
                  </AlertDescription>
                </Alert>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loadingNext || loadingSave}>
            Batal
          </Button>

          {step === 1 ? (
            <Button onClick={handleNext} disabled={loadingNext}>
              {loadingNext ? "Memverifikasi..." : "Next"}
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={loadingSave || !isValid}
            >
              {loadingSave ? "Menyimpan..." : "Simpan"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
