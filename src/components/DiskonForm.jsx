// 📁 src/components/DiskonFormModal.jsx
import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function DiskonFormModal({ onSubmit, diskon, onCancel, isOpen }) {
  const today = new Date().toISOString().split("T")[0];
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(diskon);
  const [step, setStep] = useState(isEdit ? "form" : "tipe_waktu");

  const FormError = ({ name }) => {
    if (!errors[name]) return null;
    return (
      <p className="mt-1 text-sm text-red-600">
        {errors[name]}
      </p>
    );
  };


  
  const [form, setForm] = useState({
    tipe_waktu: "periode",
    nama_diskon: "",
    tipe_diskon: "persentase",
    persentase: "",
    harga_tetap: "",
    tanggal_mulai: today,
    tanggal_selesai: "",
    status: "aktif",
  });

  const resetForm = () => {
    setForm({
      tipe_waktu: "periode",
      nama_diskon: "",
      tipe_diskon: "persentase",
      persentase: "",
      harga_tetap: "",
      tanggal_mulai: today,
      tanggal_selesai: "",
      jam_mulai: "",
      jam_selesai: "",
      status: "aktif",
    });
    setStep("tipe_waktu");
  };
  const normalizeTime = (time) => {
    if (!time) return "";
    // "7:00" → "07:00"
    if (time.length === 4) return `0${time}`;
    return time;
  };


  useEffect(() => {
    if (diskon) {
      setForm({
        tipe_waktu: diskon.tipe_waktu,
        nama_diskon: diskon.nama_diskon || "",
        tipe_diskon: diskon.tipe_diskon || "persentase",
        persentase: diskon.persentase ? String(diskon.persentase) : "",
        harga_tetap: diskon.harga_tetap ? String(diskon.harga_tetap) : "",
        tanggal_mulai: diskon.tanggal_mulai || today,
        tanggal_selesai: diskon.tanggal_selesai || "",
        jam_mulai: normalizeTime(diskon.jam_mulai),
        jam_selesai: normalizeTime(diskon.jam_selesai),
        status: diskon.status || "aktif",
      });
      setStep("form");
    } else {
      setForm({
        tipe_waktu: "periode",
        nama_diskon: "",
        tipe_diskon: "persentase",
        persentase: "",
        harga_tetap: "",
        tanggal_mulai: today,
        tanggal_selesai: "",
        jam_mulai: "",
        jam_selesai: "",
        status: "aktif",
      });
      setErrors({});
      setStep("tipe_waktu");
    }
  }, [diskon]);

  const formatRupiahInput = (value) => {
   if (value == null) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value)); 
  };

const handleHargaChange = (e) => {
  const raw = e.target.value.replace(/\D/g, "");

  // kalau kosong atau 0 → anggap belum diisi
  if (raw === "" || Number(raw) === 0) {
    setForm((prev) => ({
      ...prev,
      harga_tetap: "",
    }));
    return;
  }

  setForm((prev) => ({
    ...prev,
    harga_tetap: raw,
  }));
};



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "tanggal_mulai" && prev.tanggal_selesai < value) {
        updated.tanggal_selesai = value;
      }

      return updated;
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};
    if (form.tipe_diskon === "harga_tetap" && !form.harga_tetap) {
      newErrors.harga_tetap = "Harga tetap wajib diisi";
    }
    if (!form.tanggal_mulai) {
      newErrors.tanggal_mulai = "Tanggal mulai wajib diisi";
    }
    if (!form.tanggal_selesai) {
      newErrors.tanggal_selesai = "Tanggal selesai wajib diisi";
    }
    if (form.tipe_waktu === "harian") {
      if (!form.jam_mulai) {
        newErrors.jam_mulai = "Jam mulai wajib diisi";
      }
      if (!form.jam_selesai) {
        newErrors.jam_selesai = "Jam selesai wajib diisi";
      }
      if (
        form.jam_mulai &&
        form.jam_selesai &&
        form.jam_mulai >= form.jam_selesai
      ) {
        newErrors.jam_selesai =
          "Jam selesai harus lebih besar dari jam mulai";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      ...form,
      harga_tetap:
        form.tipe_diskon === "harga_tetap"
          ? Number(form.harga_tetap)
          : null,
      persentase:
        form.tipe_diskon === "persentase"
          ? Number(form.persentase)
          : null,
    });
  };

  useEffect(() => {
    if (!isOpen && !diskon) {
      resetForm();
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title={diskon ? "Edit Diskon" : "Tambah Diskon"}
      subtitle="Lengkapi informasi diskon produk"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            form="diskonForm"
            className="px-5 py-2 rounded-xl bg-[#622F10] hover:bg-[#4E230C] text-white shadow-md transition"
          >
            Simpan
          </button>
        </div>
      }
    >
      {!diskon && step === "tipe_waktu" && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Pilih Tipe Waktu Diskon
          </h3>
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, tipe_waktu: "periode" }));
                setStep("form");
              }}
              className="w-full aspect-square p-4 rounded-xl border hover:border-[#622F10] hover:bg-[#622F10]/5 transition flex flex-col items-center justify-center"
            >
              <CalendarIcon className="w-8 h-8 mb-2 text-gray-700" />
              <p className="font-medium text-center">Periode</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, tipe_waktu: "harian" }));
                setStep("form");
              }}
              className="w-full aspect-square p-4 rounded-xl border hover:border-[#622F10] hover:bg-[#622F10]/5 transition flex flex-col items-center justify-center"
            >
              <ClockIcon className="w-8 h-8 mb-2 text-gray-700" />
              <p className="font-medium text-center">Jam Tertentu</p>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Tipe Waktu adalah jenis waktu berlaku diskon, apakah berdasarkan periode
            tanggal tertentu atau jam tertentu dalam sehari.
          </p>
        </div>
      )}
      {step === "form" && (
        <form id="diskonForm" onSubmit={handleSubmit} className="space-y-4 text-gray-800">
          <div>
            <input
              type="hidden"
              name="tipe_waktu"
              value={form.tipe_waktu}
              className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nama Promo</label>
            <input
              type="text"
              name="nama_diskon"
              placeholder="Nama Diskon"
              value={form.nama_diskon}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
            />
            <FormError name="nama_diskon" />
          </div>
         <div>
          <label className="block text-sm font-medium mb-3">Tipe Diskon</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'tipe_diskon', value: 'persentase' } })}
              className={`flex-1 py-3 px-4 rounded-xl border transition flex items-center justify-center ${
                form.tipe_diskon === 'persentase'
                  ? 'border-[#622F10] bg-[#622F10]/10 text-[#622F10]'
                  : 'border-gray-300 hover:border-[#622F10] hover:bg-[#622F10]/5'
              }`}
            >
              <span className="font-medium">Persentase</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'tipe_diskon', value: 'harga_tetap' } })}
              className={`flex-1 py-3 px-4 rounded-xl border transition flex items-center justify-center ${
                form.tipe_diskon === 'harga_tetap'
                  ? 'border-[#622F10] bg-[#622F10]/10 text-[#622F10]'
                  : 'border-gray-300 hover:border-[#622F10] hover:bg-[#622F10]/5'
              }`}
            >
              <span className="font-medium">Harga Tetap</span>
            </button>
          </div>
        </div>
          {form.tipe_diskon === "persentase" && (
            <div>
              <label className="block text-sm font-medium">
                Persentase Diskon (%)
              </label>
              <input
                type="number"
                name="persentase"
                placeholder="Masukkan persentase"
                value={form.persentase}
                onChange={handleChange}
                min="1"
                max="100"
                required
                className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
              />
              <FormError name="persentase" />
            </div>
          )}
          {form.tipe_diskon === "harga_tetap" && (
            <div>
              <label className="block text-sm font-medium">Harga Tetap (Rp)</label>
              <input
                type="text"
                name="harga_tetap"
                placeholder="Masukkan harga tetap"
                value={formatRupiahInput(form.harga_tetap)}
                onChange={handleHargaChange}
                inputMode="numeric"
                min="0"
                required
                className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
              />
              <FormError name="harga_tetap" />
            </div>
          )}
          <div class="flex gap-4 flex-row">
            <div>
              <label className="block text-sm font-medium">Tanggal Mulai</label>
              <input
                type="date"
                name="tanggal_mulai"
                value={form.tanggal_mulai}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
              />
              <FormError name="tanggal_mulai" />
            </div>
            {form.tipe_waktu === "harian" && (
              <>
                <div className="flex gap-4 flex-row">
                  <div>
                    <label className="block text-sm font-medium">Jam Mulai</label>
                    <input
                      type="time"
                      name="jam_mulai"
                      value={form.jam_mulai}
                      onChange={handleChange}
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
                    />
                    <FormError name="jam_mulai" />
                  </div>
                </div>
              </>
            )}
          </div>
          <div class="flex gap-4 flex-row">
            <div>
              <label className="block text-sm font-medium">Tanggal Selesai</label>
              <input
                type="date"
                name="tanggal_selesai"
                value={form.tanggal_selesai}
                onChange={handleChange}
                min={form.tanggal_mulai}
                className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
              />
              <FormError name="tanggal_selesai" />
            </div>
            {form.tipe_waktu === "harian" && (
              <>
                <div className="flex gap-4 flex-row">
                  <div>
                    <label className="block text-sm font-medium">Jam Selesai</label>
                    <input
                      type="time"
                      name="jam_selesai"
                      value={form.jam_selesai}
                      onChange={handleChange}
                      min={form.jam_mulai}
                      className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-[#622F10] focus:ring focus:ring-[#622F10]/20 outline-none transition"
                    />
                    <FormError name="jam_selesai" />
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
        )}
    </BaseModal>
  );
}
