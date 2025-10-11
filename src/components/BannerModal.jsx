import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropUtils";

const BannerModal = ({ onClose, refresh }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

const handleUpload = async () => {
  if (!imageSrc || !croppedAreaPixels) return;
  setLoading(true);

  try {
    console.log("dsada")
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

    const file = new File([croppedBlob], "banner.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", file);

    // 🔹 Kirim ke backend
    const response = await fetch("http://localhost:3000/api/iklan-banner", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg;
      try {
        const json = JSON.parse(text);
        errorMsg = json.error || "Gagal upload banner";
      } catch {
        errorMsg = text || "Gagal upload banner (server error)";
      }
      throw new Error(errorMsg);
    }

    await refresh();
    onClose();
  } catch (err) {
    alert("❌ Gagal upload banner: " + err.message);
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Upload Banner Baru
      </h2>

      {!imageSrc ? (
        <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block mx-auto text-sm"
          />
          <p className="text-sm mt-2 text-gray-500">
            Upload gambar dengan rasio 3.5:1
          </p>
        </div>
      ) : (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3.53}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      {imageSrc && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
            className="w-full md:w-1/2"
          />
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {loading ? "Mengupload..." : "Upload"}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerModal;
