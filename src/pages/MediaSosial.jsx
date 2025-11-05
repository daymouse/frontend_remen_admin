// pages/MediaSosial.jsx
import React, { useEffect, useState } from "react";
import { Plus, Trash, Pencil } from "lucide-react";
import { apiFetch } from "./../server";
import MediaSosialModal from "../components/MediaSosialModal";

export default function MediaSosial() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    try {
      const json = await apiFetch("/api/media-sosial");
      setData(json);
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (form) => {
    try {
      await apiFetch(
        editing ? `/api/media-sosial/${editing.id}` : `/api/media-sosial`,
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(form),
        }
      );
      fetchData();
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      console.error("Gagal menyimpan:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/media-sosial/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Gagal hapus:", err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#622F10]">
          Media Sosial
        </h1>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 bg-[#622F10] hover:bg-[#8B4A23] text-white px-4 py-2 rounded-2xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-600">Memuat data...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 italic">
            Belum ada data media sosial.
          </p>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-[#622F10]">
                    {item.platform}
                  </h2>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.status === "aktif"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 break-words">
                  {item.handle}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#622F10] hover:text-[#8B4A23] hover:underline text-sm break-all"
                >
                  {item.url}
                </a>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => {
                    setEditing(item);
                    setFormOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 text-[#622F10] border border-[#622F10] rounded-xl px-3 py-1 hover:bg-[#FFEDE3] transition text-sm"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-1 transition text-sm"
                >
                  <Trash className="w-4 h-4" /> Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      <MediaSosialModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        editing={editing}
      />
    </div>
  );
}
