import { useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

export default function ImageUploader({ onChange }) {
  const [image, setImage] = useState(null); // URL preview
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // Blob hasil crop

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setCroppedImage(null);
    }
  };

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSetImage = async () => {
    if (!image || !croppedAreaPixels) return;
    const blob = await getCroppedImg(image, croppedAreaPixels);
    setCroppedImage(blob);
    onChange(blob); // kirim ke parent ModalAddProduk
    setImage(null); // hide Cropper
  };

  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {!image && !croppedImage && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />
      )}

      {image && (
        <>
          <div className="relative w-full h-64 bg-gray-100 rounded overflow-hidden">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <label className="text-sm">Zoom:</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleSetImage}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Set Gambar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 text-black px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {croppedImage && (
        <div>
          <p className="text-sm mb-1">Preview:</p>
          <img
            src={URL.createObjectURL(croppedImage)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
}
