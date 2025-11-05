// components/MediaSosialModal.jsx
import React, { useState, useEffect } from "react";
import BaseModal from "./BaseModal";

export default function MediaSosialModal({
  isOpen,
  onClose,
  onSubmit,
  editing,
}) {
  const [form, setForm] = useState({
    platform: "",
    handle: "",
    url: "",
    status: "aktif",
  });

  useEffect(() => {
    if (editing) setForm(editing);
    else
      setForm({
        platform: "",
        handle: "",
        url: "",
        status: "aktif",
      });
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      title={editing ? "Edit Media Sosial" : "Tambah Media Sosial"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {["platform", "handle", "url"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field}
            </label>
            <input
              type={field === "url" ? "url" : "text"}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#622F10] text-gray-700 transition-all"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required={field !== "handle"}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#622F10] text-gray-700 transition-all"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#622F10] hover:bg-[#8B4A23] text-white rounded-xl transition"
          >
            {editing ? "Simpan Perubahan" : "Tambah"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
