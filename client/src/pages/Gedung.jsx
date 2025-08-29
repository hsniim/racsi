import { useState, useEffect } from "react";
import axios from "axios";
import { Building2, MapPin } from "lucide-react";

export default function Gedung() {
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    nama_gedung: "",
    lokasi_gedung: "Jakarta",
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
      setForm({ nama_gedung: "", lokasi_gedung: "Jakarta" });
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
        <div className="mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border border-gray-600/30"
            >
              Tambah Gedung
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
                  <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Nama Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium last:rounded-tr-xl last:rounded-br-xl">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Lokasi
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {gedungs.length > 0 ? (
                  gedungs.map((g, index) => (
                    <tr
                      key={g.id_gedung}
                      className={`border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/30 ${
                        index === gedungs.length - 1 ? 'last:rounded-b-xl' : ''
                      }`}
                    >
                      <td className="p-4 text-gray-200 first:rounded-tl-xl first:rounded-bl-xl">{g.nama_gedung}</td>
                      <td className="p-4 text-gray-200 last:rounded-tr-xl last:rounded-br-xl">{g.lokasi_gedung}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="p-8 text-center text-gray-400">
                      Tidak ada data gedung
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
