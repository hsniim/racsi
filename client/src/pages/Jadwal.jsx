import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Calendar, Clock, ClipboardList, User } from "lucide-react";

export default function Jadwal() {
  const [jadwals, setJadwals] = useState([]);
  const [kegiatans, setKegiatans] = useState([]);
  const [form, setForm] = useState({
    id_kegiatan: "",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchJadwals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jadwal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJadwals(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data jadwal");
    }
  };

  const fetchKegiatans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/kegiatan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKegiatans(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJadwals();
    fetchKegiatans();

    // Auto refresh setiap 10 detik
    const interval = setInterval(() => {
      fetchJadwals();
    }, 10000); // 10000 ms = 10 detik

    return () => clearInterval(interval); // bersihkan interval saat komponen di-unmount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/jadwal/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Jadwal berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/jadwal", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Jadwal berhasil ditambahkan!");
      }
      setForm({ id_kegiatan: "", tanggal: "", waktu_mulai: "", waktu_selesai: "" });
      setEditId(null);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchJadwals();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan jadwal");
      setSuccess("");
    }
  };

  const handleEdit = (j) => {
    setForm({
      id_kegiatan: j.id_kegiatan,
      tanggal: j.tanggal,
      waktu_mulai: j.waktu_mulai,
      waktu_selesai: j.waktu_selesai,
    });
    setEditId(j.id_jadwal);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jadwal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Jadwal berhasil dihapus!");
      setTimeout(() => setSuccess(""), 3000);
      fetchJadwals();
    } catch (err) {
      setError("Gagal menghapus jadwal");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola Jadwal
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
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit Jadwal" : "Tambah Jadwal Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Kegiatan</label>
              <select
                value={form.id_kegiatan}
                onChange={(e) => setForm({ ...form, id_kegiatan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">Pilih Kegiatan</option>
                {kegiatans.map((k) => (
                  <option key={k.id_kegiatan} value={k.id_kegiatan}>
                    {k.nama_kegiatan} - {k.nama_ruangan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Waktu Mulai</label>
              <input
                type="time"
                value={form.waktu_mulai}
                onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Waktu Selesai</label>
              <input
                type="time"
                value={form.waktu_selesai}
                onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border border-gray-600/30 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> {editId ? "Simpan Perubahan" : "Tambah Jadwal"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar Jadwal</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {jadwals.length} Jadwal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 backdrop-blur-sm">
                <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap first:rounded-tl-xl first:rounded-bl-xl">
                  <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Kegiatan</div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> Pengguna</div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Tanggal</div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu Mulai</div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu Selesai</div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jadwals.length > 0 ? (
                jadwals.map((j) => (
                  <tr
                    key={j.id_jadwal}
                    className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200"
                  >
                    <td className="p-4 text-gray-200 font-medium whitespace-nowrap">{j.nama_kegiatan}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap">{j.pengguna}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap">{j.tanggal}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap">{j.waktu_mulai}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap">{j.waktu_selesai}</td>
                    <td className="p-4 text-gray-200 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(j)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(j.id_jadwal)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <ClipboardList className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-lg mb-2">Tidak ada data jadwal</p>
                      <p className="text-sm text-gray-500">Mulai dengan menambahkan jadwal pertama Anda</p>
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
