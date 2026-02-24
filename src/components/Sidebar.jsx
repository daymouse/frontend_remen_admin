import React, { useState } from "react";
import {
  LayoutDashboard,
  Utensils,
  Percent,
  Info,
  Share2,
  Image,
  MessageSquare,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import ProfilModal from "./ProfilModal";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfilModal, setShowProfilModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    landing: true,
    management: true
  });
  const location = useLocation();

  // Warna dominan dan senada
  const primary = "#622F10";
  const hover = "#8B4A23";
  const bgLight = "#F7EFEA";
  const borderColor = "#E5D5C9";

  // Menu Landing Page
  const landingMenus = [
    { name: "Menu", icon: <Utensils size={18} />, path: "/dashboard" },
    { name: "Diskon", icon: <Percent size={18} />, path: "/dashboard/diskon" },
    { name: "Content", icon: <Info size={18} />, path: "/dashboard/content" },
    { name: "Media Sosial", icon: <Share2 size={18} />, path: "/dashboard/sosial" },
    { name: "Iklan Banner", icon: <Image size={18} />, path: "/dashboard/iklan" },
    { name: "Testimoni", icon: <MessageSquare size={18} />, path: "/dashboard/testimoni" },
  ];

  const managementMenus = [
    { name: "Manajement User", icon: <User size={18} />, path: "/dashboard/manajement-user" },
    { name: "Petugas Jaga", icon: <User size={18} />, path: "/dashboard/petugas-jaga" },
    { name: "Laporan Pesanan", icon: <LayoutDashboard size={18} />, path: "/dashboard/laporan-pesanan" },
    { name: "Komisi", icon: <LayoutDashboard size={18} />, path: "/dashboard/komisi" },
    { name: "Bahan Baku", icon: <LayoutDashboard size={18} />, path: "/dashboard/bahan-baku" },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const MenuSection = ({ title, menus, sectionKey }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="mb-6">
        {/* Section Header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span className="font-semibold text-gray-700 uppercase tracking-wide text-sm">
            {title}
          </span>
          {isExpanded ? 
            <ChevronDown size={16} className="text-gray-500" /> : 
            <ChevronRight size={16} className="text-gray-500" />
          }
        </button>

        {/* Menu Items */}
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {menus.map((menu, idx) => {
              const active = location.pathname === menu.path;
              return (
                <NavLink
                  key={idx}
                  to={menu.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 group ${
                    active
                      ? "bg-[#622F10] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className={`transition-colors ${
                    active ? "text-white" : "text-[#622F10]"
                  }`}>
                    {menu.icon}
                  </div>
                  <span className="font-medium text-sm">{menu.name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Tombol Hamburger (Mobile) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md focus:outline-none text-white shadow-lg transition-all"
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
          borderRight: `2px solid ${borderColor}`,
        }}
      >
        {/* Logo */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: primary }}>
              Remen Coffe
            </h1>
            <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu Sections */}
        <nav className="flex-1 px-2 overflow-y-auto">
          <MenuSection 
            title="Landing Page" 
            menus={landingMenus} 
            sectionKey="landing" 
          />
          
          <div className="mx-4 my-4 border-t" style={{ borderColor: borderColor }}></div>
          
          <MenuSection 
            title="Management" 
            menus={managementMenus} 
            sectionKey="management" 
          />
        </nav>

        {/* Footer / Profile */}
        <div className="px-6 mt-auto border-t pt-4" style={{ borderColor: borderColor }}>
          <NavLink
            to='/dashboard/profile'
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
            </div>
          </NavLink>
        </div>
      </aside>

      {/* Modal Profil */}
      <ProfilModal 
        isOpen={showProfilModal} 
        onClose={() => setShowProfilModal(false)} 
      />
    </>
  );
}