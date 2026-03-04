import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Menu from "@/pages/produk/Menu";
import Diskon from "./Diskon";
import Tentang from "./TentangKami";
import Sosial from "./MediaSosial";
import IklanBanner from "./IklanBaner";
import Testimoni from "./TestimoniPage";
//import Profil from "./ProfilAdminPage";
import ManajementUser from "@/pages/manjementUser/ManajementUser";
import LaporanPesanan from "./LaporanPesanan";
import UserPendding from "@/pages/manjementUser/UserPending";
import Petugasjaga from "./PetugasJaga";
import Komisi from "@/pages/komisi/Komisi";
import RiwayatKomisi from "@/pages/komisi/RiwayatKomisi";
import Profil from "@/pages/ProfileAdmin"
import AuthResetPassword from "@/pages/AuthResetPassword"
import BahanBaku from "@/pages/BahanBaku";
import DetailProdukPage from "./detailProduk";
import StokMovement from "@/pages/BahanBaku/StokMovement"
import StokRealPage from "@/pages/BahanBaku/LaporanStokReal"

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 py-8 md:p-0 bg-gray-50 min-h-screen overflow-auto" style={{ height: 'calc(100vh - 1rem)' }}>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="diskon" element={<Diskon />} />
          <Route path="content" element={<Tentang />} />
          <Route path="sosial" element={<Sosial />} />
          <Route path="iklan" element={<IklanBanner />} />
          <Route path="testimoni" element={<Testimoni />} />
          <Route path="manajement-user" element={<ManajementUser />} />
          <Route path="laporan-pesanan" element={<LaporanPesanan />} />
          <Route path="manajement-user/user-pending" element={<UserPendding />} />
          <Route path="petugas-jaga" element={<Petugasjaga />} />
          <Route path="komisi" element={<Komisi />}/>
          <Route path="riwayat-komisi" element={<RiwayatKomisi />}/>
          <Route path="profile" element={<Profil />}/>
          <Route path="reset-password" element={<AuthResetPassword />} />
          <Route path="bahan-baku" element={<BahanBaku />} />
          <Route path="detail-produk/:id" element={<DetailProdukPage />} />
          <Route path="stok-movement/:id" element={<StokMovement />} />
          <Route path="stok-adjustment" element={<StokRealPage />} />
        </Routes>
      </main>
    </div>
  );
}
