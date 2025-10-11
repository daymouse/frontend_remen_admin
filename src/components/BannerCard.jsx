import React from "react";

const BannerCard = ({ banner, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img
        src={banner.url_iklan}
        alt="banner"
        className="w-full h-40 object-cover aspect-[21/9]"
      />
      <div className="p-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">ID: {banner.id}</span>
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

export default BannerCard;
