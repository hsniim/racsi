import { useState, useEffect } from "react";
import axios from "axios";
import { Building2 } from "lucide-react"; // ✅ Tambah import icon

export default function Gedung() {
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    nama_gedung: "",
    lokasi_gedung: "Jakarta",
    pj_gedung: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchGedungs = async () => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setGedungs(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data gedung");
    }
  };

  useEffect(() => {
    fetchGedungs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/gedung", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ nama_gedung: "", lokasi_gedung: "Jakarta", pj_gedung: "" });
      setSuccess("Gedung berhasil ditambahkan!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchGedungs();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menambahkan gedung");
      setSuccess("");
    }
  };

  return (
    <div className="">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Kelola Gedung
          </h1>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              {success}
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Tambah Gedung Baru</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nama Gedung
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama gedung"
                  value={form.nama_gedung}
                  onChange={(e) => setForm({ ...form, nama_gedung: e.target.value })}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Lokasi
                </label>
                <select
                  value={form.lokasi_gedung}
                  onChange={(e) => setForm({ ...form, lokasi_gedung: e.target.value })}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="Jakarta">Jakarta</option>
                  <option value="Depok">Depok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Penanggung Jawab
                </label>
                <input
                  type="text"
                  placeholder="Nama penanggung jawab"
                  value={form.pj_gedung}
                  onChange={(e) => setForm({ ...form, pj_gedung: e.target.value })}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border border-gray-600/30"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Gedung
              </span>
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-300">Daftar Gedung</h2>
            <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
              {gedungs.length} Gedung
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 backdrop-blur-sm">
                  <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl last:rounded-tr-xl">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2 0V9m0 0H5m14 0V3" />
                      </svg>
                      Nama Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Lokasi
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Penanggung Jawab
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {gedungs.length > 0 ? (
                  gedungs.map((g, index) => (
                    <tr 
                      key={g.id_gedung || g.id} 
                      className={`border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/30 ${
                        index === gedungs.length - 1 ? 'last:rounded-b-xl' : ''
                      }`}
                    >
                      <td className="p-4 text-gray-200 first:rounded-bl-xl">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          {g.nama_gedung}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30">
                          {g.lokasi_gedung}
                        </span>
                      </td>
                      <td className="p-4 text-gray-200 last:rounded-br-xl">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-300">
                              {g.pj_gedung?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                          </div>
                          {g.pj_gedung}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2 0V9m0 0H5m14 0V3" />
                        </svg>
                        <p className="text-lg mb-2">Tidak ada data gedung</p>
                        <p className="text-sm text-gray-500">Mulai dengan menambahkan gedung pertama Anda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
