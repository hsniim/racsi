import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Building, Layers, Grid, Users, Edit, Trash2, X } from "lucide-react";

export default function Ruangan() {
  const [ruangans, setRuangans] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [form, setForm] = useState({
    id_lantai: "",
    nama_ruangan: "",
    kapasitas: "",
    status: "tidak_digunakan",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchRuangans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ruangan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRuangans(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data ruangan");
    }
  };

  const fetchLantais = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lantai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLantais(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchLantais();
    fetchRuangans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // update ruangan
        await axios.put(`http://localhost:5000/api/ruangan/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Ruangan berhasil diperbarui!");
      } else {
        // tambah ruangan
        await axios.post("http://localhost:5000/api/ruangan", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Ruangan berhasil ditambahkan!");
      }
      setForm({ id_lantai: "", nama_ruangan: "", kapasitas: "", status: "tidak_digunakan" });
      setEditId(null);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchRuangans();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan ruangan");
      setSuccess("");
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id_ruangan);
    setForm({
      id_lantai: r.id_lantai,
      nama_ruangan: r.nama_ruangan,
      kapasitas: r.kapasitas,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus ruangan ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/ruangan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Ruangan berhasil dihapus!");
      fetchRuangans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus ruangan");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ id_lantai: "", nama_ruangan: "", kapasitas: "", status: "tidak_digunakan" });
    setError("");
  };

  return (
    <div className="w-full px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola Ruangan
        </h1>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200 backdrop-blur-sm">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit Ruangan" : "Tambah Ruangan Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Lantai</label>
              <select
                value={form.id_lantai}
                onChange={(e) => setForm({ ...form, id_lantai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">Pilih Lantai</option>
                {lantais.map((l) => (
                  <option key={l.id_lantai} value={l.id_lantai}>
                    {l.nama_gedung} - Lantai {l.nomor_lantai}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nama Ruangan</label>
              <input
                type="text"
                placeholder="Masukkan nama ruangan"
                value={form.nama_ruangan}
                onChange={(e) => setForm({ ...form, nama_ruangan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Kapasitas</label>
              <input
                type="number"
                placeholder="Kapasitas ruangan"
                value={form.kapasitas}
                onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium rounded-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> {editId ? "Update Ruangan" : "Tambah Ruangan"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar Ruangan</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {ruangans.length} Ruangan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="p-4 text-gray-300 text-center first:rounded-tl-xl first:rounded-bl-xl">Gedung</th>
                <th className="p-4 text-gray-300 text-center">Lantai</th>
                <th className="p-4 text-gray-300 text-center">Ruangan</th>
                <th className="p-4 text-gray-300 text-center">Kapasitas</th>
                <th className="p-4 text-gray-300 text-center last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ruangans.length > 0 ? (
                ruangans.map((r) => (
                  <tr key={r.id_ruangan} className="border-b border-gray-700/30 hover:bg-gray-700/30">
                    <td className="p-4 text-gray-200 text-center first:rounded-tl-xl first:rounded-bl-xl">{r.nama_gedung}</td>
                    <td className="p-4 text-gray-200 text-center">{r.nomor_lantai}</td>
                    <td className="p-4 text-gray-200 text-center">{r.nama_ruangan}</td>
                    <td className="p-4 text-gray-200 text-center">{r.kapasitas}</td>
                    <td className="p-4 text-center space-x-2 last:rounded-tr-xl last:rounded-br-xl">
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        <Edit className="inline w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id_ruangan)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                      >
                        <Trash2 className="inline w-4 h-4 mr-1" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Tidak ada data ruangan
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
