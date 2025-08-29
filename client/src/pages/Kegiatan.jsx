import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Building, Layers, Grid, ClipboardList, User } from "lucide-react";

export default function Kegiatan() {
  const [kegiatans, setKegiatans] = useState([]);
  const [ruangans, setRuangans] = useState([]);
  const [form, setForm] = useState({
    id_ruangan: "",
    nama_kegiatan: "",
    deskripsi_kegiatan: "",
    pengguna: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchKegiatans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/kegiatan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKegiatans(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data kegiatan");
    }
  };

  const fetchRuangans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ruangan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRuangans(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKegiatans();
    fetchRuangans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/kegiatan/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Kegiatan berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/kegiatan", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Kegiatan berhasil ditambahkan!");
      }
      setForm({ id_ruangan: "", nama_kegiatan: "", deskripsi_kegiatan: "", pengguna: "" });
      setEditId(null);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchKegiatans();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan kegiatan");
      setSuccess("");
    }
  };

  const handleEdit = (k) => {
    setForm({
      id_ruangan: ruangans.find(r => r.nama_ruangan === k.nama_ruangan)?.id_ruangan || "",
      nama_kegiatan: k.nama_kegiatan,
      deskripsi_kegiatan: k.deskripsi_kegiatan,
      pengguna: k.pengguna,
    });
    setEditId(k.id_kegiatan);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kegiatan ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Kegiatan berhasil dihapus!");
      setTimeout(() => setSuccess(""), 3000);
      fetchKegiatans();
    } catch (err) {
      setError("Gagal menghapus kegiatan");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola Kegiatan
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
          {editId ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Ruangan</label>
              <select
                value={form.id_ruangan}
                onChange={(e) => setForm({ ...form, id_ruangan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">Pilih Ruangan</option>
                {ruangans.map((r) => (
                  <option key={r.id_ruangan} value={r.id_ruangan}>
                    {r.nama_gedung} - Lt {r.nomor_lantai} - {r.nama_ruangan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nama Kegiatan</label>
              <input
                type="text"
                placeholder="Masukkan nama kegiatan"
                value={form.nama_kegiatan}
                onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi Kegiatan</label>
              <textarea
                placeholder="Masukkan deskripsi kegiatan"
                value={form.deskripsi_kegiatan}
                onChange={(e) => setForm({ ...form, deskripsi_kegiatan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pengguna</label>
              <input
                type="text"
                placeholder="Nama pengguna"
                value={form.pengguna}
                onChange={(e) => setForm({ ...form, pengguna: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border border-gray-600/30 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> {editId ? "Simpan Perubahan" : "Tambah Kegiatan"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar Kegiatan</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {kegiatans.length} Kegiatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
          <thead>
          <tr className="bg-gray-700/50 backdrop-blur-sm">
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap first:rounded-tl-xl first:rounded-bl-xl">
              <div className="flex items-center gap-2"><Building className="w-4 h-4 " /> Gedung</div>
            </th>
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> Lantai</div>
            </th>
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
              <div className="flex items-center gap-2"><Grid className="w-4 h-4" /> Ruangan</div>
            </th>
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
              <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Kegiatan</div>
            </th>
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">Deskripsi</th>
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap">
              <div className="flex items-center gap-2"><User className="w-4 h-4" /> Pengguna</div>
            </th>
            <th className="p-4 text-left text-gray-300 font-medium whitespace-nowrap last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {kegiatans.length > 0 ? (
            kegiatans.map((k) => (
              <tr
                key={k.id_kegiatan}
                className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200"
              >
                <td className="p-4 text-gray-200 whitespace-nowrap">{k.nama_gedung}</td>
                <td className="p-4 text-gray-200 whitespace-nowrap">{k.nomor_lantai}</td>
                <td className="p-4 text-gray-200 whitespace-nowrap">{k.nama_ruangan}</td>
                <td className="p-4 text-gray-200 font-medium max-w-[180px] truncate">{k.nama_kegiatan}</td>
                <td className="p-4 text-gray-400 max-w-[250px] truncate">{k.deskripsi_kegiatan}</td>
                <td className="p-4 text-gray-200 whitespace-nowrap">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-400/30">
                    {k.pengguna}
                  </span>
                </td>
                <td className="p-4 text-gray-200 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(k)}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(k.id_kegiatan)}
                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-8 text-center text-gray-400">
                <div className="flex flex-col items-center">
                  <ClipboardList className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-lg mb-2">Tidak ada data kegiatan</p>
                  <p className="text-sm text-gray-500">Mulai dengan menambahkan kegiatan pertama Anda</p>
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
