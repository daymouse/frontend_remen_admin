import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/SidebarPetugas";
import Kasir from "./Kasir";
import LaporanPetugas from "./laporanPetugas";
// halaman isi Dashboard



export default function petugas() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 py-8 md:p-0 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Kasir />} />
          <Route path="laporan" element={<LaporanPetugas />} />
        </Routes>
      </main>
    </div>
  );
}
