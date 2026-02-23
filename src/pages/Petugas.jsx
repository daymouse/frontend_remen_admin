import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/SidebarPetugas";
import Kasir from "./Kasir";
import LaporanPetugas from "./laporanPetugas";
import Profil from "@/pages/Profil"
import AuthResetPassword from "@/pages/AuthResetPassword"
// halaman isi Dashboard



export default function petugas() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 py-8 md:p-0 bg-gray-50 min-h-screen overflow-auto" style={{ height: 'calc(100vh - 1rem)' }}>
        <Routes>
          <Route path="/" element={<Kasir />} />
          <Route path="laporan" element={<LaporanPetugas />} />
          <Route path="profile" element={<Profil />} />
          <Route path="reset-password" element={<AuthResetPassword />} />
        </Routes>
      </main>
    </div>
  );
}
