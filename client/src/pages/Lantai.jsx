import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Layers, Edit, Trash2, X } from "lucide-react";

export default function Lantai() {
  const [lantais, setLantais] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    id_gedung: "",
    nomor_lantai: "",
    pj: {
      shift: "pagi",
      nama: "",
    },
  });
  const [editId, setEditId] = useState(null);
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
      if (editId) {
        await axios.put(`http://localhost:5000/api/lantai/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Lantai + PJ berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/lantai", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Lantai + PJ berhasil ditambahkan!");
      }
      setForm({
        id_gedung: "",
        nomor_lantai: "",
        pj: { shift: "pagi", nama: "" },
      });
      setEditId(null);
      setError("");
      fetchLantais();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan lantai");
      setSuccess("");
    }
  };

  const handleEdit = (l) => {
    setEditId(l.id_lantai);
    setForm({
      id_gedung: l.id_gedung,
      nomor_lantai: l.nomor_lantai,
      pj: {
        shift: l.pj?.shift || "pagi",
        nama: l.pj?.nama || "",
      },
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus lantai ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/lantai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Lantai berhasil dihapus!");
      fetchLantais();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus lantai");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ id_gedung: "", nomor_lantai: "", pj: { shift: "pagi", nama: "" } });
    setError("");
  };

  return (
    <div className="w-full px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-200">Kelola Lantai</h1>
      </div>

      {/* Notifications */}
      {error && <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200">{success}</div>}

      {/* Form */}
      <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">{editId ? "Edit Lantai" : "Tambah Lantai Baru"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gedung */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Gedung</label>
              <select
                value={form.id_gedung}
                onChange={(e) => setForm({ ...form, id_gedung: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
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

            {/* Nomor Lantai */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nomor Lantai</label>
              <input
                type="number"
                placeholder="Masukkan nomor lantai"
                value={form.nomor_lantai}
                onChange={(e) => setForm({ ...form, nomor_lantai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            {/* PJ Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nama PJ Lantai</label>
              <input
                type="text"
                placeholder="Masukkan nama PJ"
                value={form.pj.nama}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, nama: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            {/* PJ Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Shift</label>
              <select
                value={form.pj.shift}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, shift: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="pagi">Pagi</option>
                <option value="siang">Siang</option>
                <option value="malam">Malam</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {editId && (
              <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2">
                <X className="w-4 h-4" /> Batal
              </button>
            )}
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium rounded-xl flex items-center gap-2">
              <Plus className="w-5 h-5" /> {editId ? "Update Lantai" : "Tambah Lantai"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar Lantai</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">{lantais.length} Lantai</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="p-4 text-gray-300 text-center first:rounded-tl-xl first:rounded-bl-xl">Gedung</th>
                <th className="p-4 text-gray-300 text-center">Nomor Lantai</th>
                <th className="p-4 text-gray-300 text-center">PJ Lantai</th>
                <th className="p-4 text-gray-300 text-center">Shift</th>
                <th className="p-4 text-gray-300 text-center last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lantais.length > 0 ? (
                lantais.map((l) => (
                  <tr
                    key={l.id_lantai}
                    className="border-b border-gray-700/30 hover:bg-gray-700/30"
                  >
                    <td className="p-4 text-gray-200 text-center first:rounded-tl-xl first:rounded-bl-xl">{l.nama_gedung}</td>
                    <td className="p-4 text-gray-200 text-center ">{l.nomor_lantai}</td>

                    {/* Kolom PJ Lantai */}
                    <td className="p-4 text-gray-200 text-center">
                      {l.pjs && l.pjs.length > 0 ? (
                        l.pjs.map((pj) => (
                          <div key={pj.id_pj_lantai}>{pj.nama}</div>
                        ))
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Kolom Shift */}
                    <td className="p-4 text-gray-200 text-center">
                      {l.pjs && l.pjs.length > 0 ? (
                        l.pjs.map((pj) => (
                          <div key={pj.id_pj_lantai}>{pj.shift}</div>
                        ))
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="p-4 text-center space-x-2 last:rounded-tr-xl last:rounded-br-xl">
                      <button
                        onClick={() => handleEdit(l)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        <Edit className="inline w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(l.id_lantai)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                      >
                        <Trash2 className="inline w-4 h-4 mr-1" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Tidak ada data lantai
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
