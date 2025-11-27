import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Menu from "./Menu";
import Diskon from "./Diskon";
import Tentang from "./TentangKami";
import Sosial from "./MediaSosial";
import IklanBanner from "./IklanBaner";
import Testimoni from "./TestimoniPage";
import Profil from "./ProfilAdminPage";
import ManajementUser from "./ManajementUser";
import LaporanPesanan from "./LaporanPesanan";
// halaman isi Dashboard



export default function Dashboard() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 py-8 md:p-0 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="diskon" element={<Diskon />} />
          <Route path="tentang" element={<Tentang />} />
          <Route path="sosial" element={<Sosial />} />
          <Route path="iklan" element={<IklanBanner />} />
          <Route path="testimoni" element={<Testimoni />} />
          <Route path="profil" element={<Profil />} />
          <Route path="manajement-user" element={<ManajementUser />} />
          <Route path="laporan-pesanan" element={<LaporanPesanan />} />
        </Routes>
      </main>
    </div>
  );
}
