import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import BannerModal from "../components/BannerModal";
import BannerCard from "../components/BannerCard";
import { apiFetch } from "./../server";

const IklanBanner = () => {
  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const [banners, setBanners] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch data banner
  const fetchBanners = async () => {
    try {
      const data = await apiFetch("/api/iklan-banner");
      setBanners(data);
    } catch (err) {
      console.error("Gagal mengambil banner:", err.message);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus banner ini?")) return;
    try {
      await apiFetch(`/api/iklan-banner/${id}`, { method: "DELETE" });
      fetchBanners();
    } catch (err) {
      console.error("Gagal hapus banner:", err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#622F10]">
          Iklan Banner
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#622F10] hover:bg-[#8B4A23] text-white px-4 sm:px-6 py-2 rounded-2xl shadow-lg transition-all w-full sm:w-auto text-center"
        >
          Upload Banner
        </button>
      </div>

      {/* Banner List */}
      {banners.length === 0 ? (
        <p className="text-gray-500 italic text-center mt-8">
          Belum ada banner.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onDelete={() => handleDelete(banner.id)}
            />
          ))}
        </div>
      )}

      {/* Modal Upload */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-md sm:max-w-xl transition-all">
            <BannerModal onClose={() => setIsOpen(false)} refresh={fetchBanners} />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default IklanBanner;
