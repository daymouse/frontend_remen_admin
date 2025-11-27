// components/SidebarUser.jsx
import React, { useState } from "react";
import {
  Utensils,
  Percent,
  User,
  Menu,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import ModalProfil from "./ModalProfilPetugas";

export default function SidebarUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfilModalOpen, setIsProfilModalOpen] = useState(false);
  const location = useLocation();

  // Warna dominan dan senada
  const primary = "#622F10";
  const hover = "#8B4A23";
  const bgLight = "#F7EFEA";

  const menus = [
    { name: "Home", icon: <Utensils size={20} />, path: "/petugas" },
    { name: "Laporan Pesanan", icon: <Percent size={20} />, path: "/petugas/laporan" },
  ];

  const handleProfilClick = () => {
    setIsProfilModalOpen(true);
    setIsOpen(false); // Tutup sidebar di mobile
  };

  return (
    <>
      {/* Tombol Hamburger (Mobile) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md focus:outline-none text-white shadow"
          style={{ backgroundColor: primary }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 flex flex-col py-6 z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:w-64`}
        style={{
          backgroundColor: "white",
          borderRight: `3px solid ${primary}`,
        }}
      >
        {/* Logo */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: primary }}>
            Remen Coffe
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menus.map((menu, idx) => {
            const active = location.pathname === menu.path;
            return (
              <NavLink
                key={idx}
                to={menu.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium ${
                  active
                    ? "bg-[#622F10] text-white"
                    : "text-gray-700 hover:bg-[#8B4A23] hover:text-white"
                }`}
              >
                {menu.icon}
                <span>{menu.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Profile */}
        <div className="px-6 mt-auto border-t pt-4" style={{ borderColor: bgLight }}>
          <button
            onClick={handleProfilClick}
            className="flex items-center gap-3 w-full text-gray-700 hover:opacity-90 transition group"
          >
            <div
              className="p-2 rounded-full flex items-center justify-center group-hover:bg-[#F7EFEA] transition-colors"
              style={{ backgroundColor: bgLight }}
            >
              <User size={22} color={primary} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 text-sm">Profil Saya</p>
              <p className="text-xs text-gray-500">Lihat informasi akun</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Modal Profil */}
      <ModalProfil 
        isOpen={isProfilModalOpen}
        onClose={() => setIsProfilModalOpen(false)}
      />
    </>
  );
}