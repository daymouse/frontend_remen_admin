import { useEffect, useState } from "react"
import { apiFetch } from "../server.jsx"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import ChangePasswordModal from  "@/components/profiil/UbahPassword.jsx"
import ChangeEmailModal from "@/components/profiil/UbahEmail.jsx"
import { useNavigate } from "react-router-dom"


export default function Profil() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const fetchProfil = async () => {
    try {
      setLoading(true)
      const response = await apiFetch("/api/profile")
      setData(response.data)
      setForm(response.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfil()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }
  const handleEmailChanged = () => {
    fetchProfil(); // refresh data profil
  };

 
    const handleSave = async () => {
        try {
            setLoading(true);

            const response = await apiFetch("/api/profile/edit-admin", {
            method: "PUT",
            body: JSON.stringify(form),
            });

            if (!response.status) {
            throw new Error(response.message || "Gagal memperbarui profil");
            }

            alert(response.message || "Profile berhasil diperbarui");

            setData(form); 
            setEditMode(false);

        } catch (err) {
            console.error(err);
            alert(err.message || "Terjadi kesalahan saat menyimpan profil");
        } finally {
            setLoading(false);
        }
    };

  const handleLogout = async () => {
    if (!confirm("Apakah yakin ingin logout?"))  {
      window.addEventListener("confirm-ok", handleLogout, { once: true })
      return
    }

    try {
      await apiFetch("/auth/logout", { method: "POST" });
      setData(null);
      setForm({});
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error logging out:", err);
      navigate("/login", { replace: true });
    }
  };


  const handleCancel = () => {
    setForm(data)
    setEditMode(false)
  }

  if (loading || !data) return <p>Loading...</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile</CardTitle>

            {!editMode ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditMode(true)}>
                    Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowPasswordModal(true)}>
                    Ubah Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEmailModal(true)}>
                    Ubah Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                    Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
                </div>
            )}
        </CardHeader>


        <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-4" >
                <p className=" font-semibold tracking-tight">Akun</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                        name="username"
                        value={form.username || ""}
                        onChange={handleChange}
                        disabled={!editMode}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                        name="email"
                        value={form.email || ""}
                        disabled
                        />
                    </div>
                </div>
            </div>
          <div className="flex flex-col gap-4" >
            <p className=" font-semibold tracking-tight">Informasi Pribadi</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                    name="fullname"
                    value="Admin Remen"
                    disabled
                    />
                </div>

                <div className="space-y-2">
                    <Label>Nickname</Label>
                    <Input
                    name="nickname"
                    value="admin"
                    disabled
                    />
                </div>

                <div className="space-y-2">
                    <Label>Kelas</Label>
                    <Input
                    name="kelas"
                    value=""
                    disabled
                    />
                </div>
                <div className="space-y-2">
                    <Label>No WhatsApp</Label>
                    <Input
                    name="no_wa"
                    value=""
                    disabled
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Created At</Label>
                    <Input value={formatDate(data.created_at)}disabled />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={async (newPassword) => {
          try {
            await apiFetch("/api/profile/update-password", {
              method: "PUT",
              body: JSON.stringify({
                passwordNew: newPassword,
                passwordNewConfirm: newPassword,
              }),
            });

            alert("Password berhasil diperbarui");
          } catch (err) {
            alert(err.message);
          }
        }}
      />
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={handleEmailChanged}
      />

    </div>
  )
}
