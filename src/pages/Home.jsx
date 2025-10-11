import React, { useEffect, useState } from "react";
import { apiFetch } from "./../server.jsx";
import { motion } from "framer-motion";
import { Tag, Calendar } from "lucide-react";

const Home = () => {
  const [produkNonBase, setProdukNonBase] = useState([]);
  const [produkBase, setProdukBase] = useState([]);
  const [diskon, setDiskon] = useState([]);
  const [mediaSosial, setMediaSosial] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nonBase = await apiFetch("/api/produk/non-base");
        const base = await apiFetch("/api/produk/base");
        const diskonData = await apiFetch("/api/diskon");
        const media = await apiFetch("/api/media-sosial");

        setProdukNonBase(nonBase || []);
        setProdukBase(base || []);
        setDiskon(diskonData || []);
        setMediaSosial(media || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="grid grid-cols-3 h-screen gap-6 p-6 bg-gray-100">
      {/* Bagian Kiri 2/3 */}
      <div className="col-span-2 grid grid-cols-2 gap-6 overflow-y-auto">
        {/* Produk Non-Base Seller */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700">
            Produk Lainnya
          </h2>
          <div className="space-y-4">
            {produkNonBase.length > 0 ? (
              produkNonBase.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 border p-4 rounded-xl shadow-sm hover:shadow-md transition bg-gradient-to-r from-pink-50 to-white"
                >
                  <img
                    src={p.gambar}
                    alt={p.nama_produk}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {p.nama_produk}
                    </h3>
                    <p className="text-pink-600 font-bold">
                      Rp{p.harga?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada produk lainnya</p>
            )}
          </div>
        </div>
        {/* Produk Base Seller */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700">
            Produk Best Seller
          </h2>
          <div className="space-y-4">
            {produkBase.length > 0 ? (
              produkBase.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 border p-4 rounded-xl shadow-sm hover:shadow-md transition bg-gradient-to-r from-indigo-50 to-white"
                >
                  <img
                    src={p.gambar}
                    alt={p.nama_produk}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {p.nama_produk}
                    </h3>
                    <p className="text-indigo-600 font-bold">
                     {p.id_diskon ? (
                            <div>
                            <p className="text-xl font-bold text-orange-500">
                                Rp {parseFloat(p.harga_akhir).toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-gray-400 line-through">
                                Rp {parseFloat(p.harga).toLocaleString("id-ID")}
                            </p>
                            </div>
                        ) : (
                            <p className="font-bold text-orange-500">
                            Rp {parseFloat(p.harga).toLocaleString("id-ID")}
                            </p>
                        )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada produk best seller</p>
            )}
          </div>
        </div>
      </div>

      {/* Bagian Kanan 1/3 */}
      <div className="flex flex-col gap-6">
        {/* Diskon */}
        <div className="bg-white p-4 rounded-2xl shadow flex-1">
          <h2 className="text-xl font-bold mb-4">Diskon</h2>
          {diskon.length > 0 ? (
            <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-4">
              {diskon.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 shadow rounded-xl p-4 border hover:shadow-lg transition"
                >
                  {/* Header: Nama & Status */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-semibold text-md text-gray-800">
                      {d.nama_diskon}
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        d.status === "aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  {/* Info Diskon */}
                  <div className="space-y-2 text-gray-600 text-sm">
                    <p className="flex items-center gap-2 font-medium text-indigo-700">
                      <Tag size={16} />
                      {d.tipe_diskon === "persentase"
                        ? `${d.persentase}%`
                        : `Rp${d.harga_tetap?.toLocaleString()}`}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} /> {d.tanggal_mulai} -{" "}
                      {d.tanggal_selesai}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada diskon</p>
          )}
        </div>

        {/* Media Sosial */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex-1">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Media Sosial</h2>
          {mediaSosial.length > 0 ? (
            <ul className="space-y-3">
              {mediaSosial.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span className="font-semibold">{m.platform}</span> 
                    <span className="text-gray-500">@{m.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Tidak ada media sosial</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
