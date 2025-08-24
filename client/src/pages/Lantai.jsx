import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Building, Layers, Sun, Moon } from "lucide-react";

export default function Lantai() {
  const [lantais, setLantais] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    id_gedung: "",
    nomor_lantai: "",
    pj_lantaipagi: "",
    pj_lantaisiang: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchLantais = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lantai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLantais(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data lantai");
    }
  };

  const fetchGedungs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGedungs(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchGedungs();
    fetchLantais();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/lantai", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ id_gedung: "", nomor_lantai: "", pj_lantaipagi: "", pj_lantaisiang: "" });
      setSuccess("Lantai berhasil ditambahkan!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchLantais();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menambahkan lantai");
      setSuccess("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola Lantai
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

      {/* Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Tambah Lantai Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Gedung</label>
              <select
                value={form.id_gedung}
                onChange={(e) => setForm({ ...form, id_gedung: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              >
                <option value="">Pilih Gedung</option>
                {gedungs.map((g) => (
                  <option key={g.id_gedung} value={g.id_gedung}>
                    {g.nama_gedung}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nomor Lantai</label>
              <input
                type="number"
                placeholder="Masukkan nomor lantai"
                value={form.nomor_lantai}
                onChange={(e) => setForm({ ...form, nomor_lantai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">PJ Pagi</label>
              <input
                type="text"
                placeholder="Penanggung jawab pagi"
                value={form.pj_lantaipagi}
                onChange={(e) => setForm({ ...form, pj_lantaipagi: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">PJ Siang</label>
              <input
                type="text"
                placeholder="Penanggung jawab siang"
                value={form.pj_lantaisiang}
                onChange={(e) => setForm({ ...form, pj_lantaisiang: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border border-gray-600/30 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Tambah Lantai
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar Lantai</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {lantais.length} Lantai
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 backdrop-blur-sm">
                <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl last:rounded-tr-xl">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" /> Gedung
                  </div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Lantai
                  </div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" /> PJ Pagi
                  </div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium last:rounded-tr-xl">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" /> PJ Siang
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {lantais.length > 0 ? (
                lantais.map((l, index) => (
                  <tr
                    key={l.id_lantai || l.id}
                    className={`border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/30 ${
                      index === lantais.length - 1 ? "last:rounded-b-xl" : ""
                    }`}
                  >
                    <td className="p-4 text-gray-200 first:rounded-bl-xl">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        {l.nama_gedung}
                      </div>
                    </td>
                    <td className="p-4 text-gray-200">{l.nomor_lantai}</td>
                    <td className="p-4 text-gray-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-300">
                            {l.pj_lantaipagi?.charAt(0)?.toUpperCase() || "P"}
                          </span>
                        </div>
                        {l.pj_lantaipagi}
                      </div>
                    </td>
                    <td className="p-4 text-gray-200 last:rounded-br-xl">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-300">
                            {l.pj_lantaisiang?.charAt(0)?.toUpperCase() || "S"}
                          </span>
                        </div>
                        {l.pj_lantaisiang}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2 0V9m0 0H5m14 0V3" />
                      </svg>
                      <p className="text-lg mb-2">Tidak ada data lantai</p>
                      <p className="text-sm text-gray-500">Mulai dengan menambahkan lantai pertama Anda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
