import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, User, Edit, Trash2, X } from "lucide-react";

export default function PJLantai() {
  const [pjs, setPjs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [form, setForm] = useState({
    id_lantai: "",
    shift: "pagi",
    nama: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch semua PJ Lantai
  const fetchPJs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/pj-lantai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPjs(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data PJ Lantai");
    }
  };

  // Fetch semua lantai untuk dropdown
  const fetchLantais = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lantai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLantais(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Gagal mengambil data lantai");
    }
  };

  useEffect(() => {
    fetchPJs();
    fetchLantais();
  }, []);

  // Submit tambah/update PJ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_lantai || !form.nama || !form.shift) {
      setError("id_lantai, nama, dan shift wajib diisi");
      return;
    }

    try {
      if (editId) {
        // Update PJ
        await axios.put(`http://localhost:5000/api/pj-lantai/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("PJ Lantai berhasil diperbarui!");
      } else {
        // Tambah PJ
        await axios.post("http://localhost:5000/api/pj-lantai", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("PJ Lantai berhasil ditambahkan!");
      }

      setForm({ id_lantai: "", shift: "pagi", nama: "" });
      setEditId(null);
      setError("");
      fetchPJs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan PJ Lantai");
      setSuccess("");
    }
  };

  // Edit PJ
  const handleEdit = (pj) => {
    setEditId(pj.id_pj_lantai);
    setForm({
      id_lantai: pj.id_lantai,
      shift: pj.shift,
      nama: pj.nama,
    });
  };

  // Hapus PJ
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus PJ Lantai ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/pj-lantai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("PJ Lantai berhasil dihapus!");
      fetchPJs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus PJ Lantai");
    }
  };

  // Batalkan edit
  const cancelEdit = () => {
    setEditId(null);
    setForm({ id_lantai: "", shift: "pagi", nama: "" });
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola PJ Lantai
        </h1>
      </div>

      {/* Notifications */}
      {error && <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200">{success}</div>}

      {/* Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit PJ Lantai" : "Tambah PJ Lantai Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dropdown Lantai */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Lantai</label>
              <select
                value={form.id_lantai}
                onChange={(e) => setForm({ ...form, id_lantai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">-- Pilih Lantai --</option>
                {lantais.map((l) => (
                  <option key={l.id_lantai} value={l.id_lantai}>
                    {l.nama_gedung} - Lantai {l.nomor_lantai}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Shift</label>
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="pagi">Pagi</option>
                <option value="siang">Siang</option>
                <option value="malam">Malam</option>
              </select>
            </div>

            {/* Input Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nama PJ</label>
              <input
                type="text"
                placeholder="Nama penanggung jawab"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {editId && (
              <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2">
                <X className="w-4 h-4" /> Batal
              </button>
            )}
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium rounded-xl flex items-center gap-2">
              <Plus className="w-5 h-5" /> {editId ? "Update PJ" : "Tambah PJ"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar PJ Lantai</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {pjs.length} PJ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="p-4 text-left text-gray-300 first:rounded-tl-xl first:rounded-bl-xl text-center">Nama</th>
                <th className="p-4 text-left text-gray-300 text-center">Shift</th>
                <th className="p-4 text-left text-gray-300 text-center">Lantai</th>
                <th className="p-4 text-left text-gray-300 last:rounded-tr-xl last:rounded-br-xl text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pjs.length > 0 ? (
                pjs.map((pj) => (
                  <tr key={pj.id_pj_lantai} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200">
                    <td className="p-4 text-gray-200 whitespace-nowrap first:rounded-tl-xl first:rounded-bl-xl text-center">{pj.nama}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap capitalize text-center">{pj.shift}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap text-center">{pj.nama_gedung} - Lantai {pj.nomor_lantai}</td>
                    <td className="p-4 text-gray-200 space-x-2 whitespace-nowrap last:rounded-tr-xl last:rounded-br-xl text-center">
                      <button
                        onClick={() => handleEdit(pj)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pj.id_pj_lantai)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <User className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-lg mb-2">Tidak ada data PJ Lantai</p>
                      <p className="text-sm text-gray-500">Mulai dengan menambahkan PJ Lantai pertama Anda</p>
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
