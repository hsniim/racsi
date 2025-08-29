import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, User, Phone, Link, Edit, Trash2, X } from "lucide-react";

export default function PJGedung() {
  const [pjs, setPjs] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    id_gedung: "",
    nama: "",
    no_telp: "",
    link_peminjaman: "",
    qrcodepath_pinjam: "",
    qrcodepath_kontak: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch semua PJ
  const fetchPJs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/pj-gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPjs(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data PJ Gedung");
    }
  };

  // Fetch semua gedung untuk dropdown
  const fetchGedungs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGedungs(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Gagal mengambil data gedung");
    }
  };

  useEffect(() => {
    fetchPJs();
    fetchGedungs();
  }, []);

  // Submit tambah/update PJ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_gedung || !form.nama || !form.no_telp) {
      setError("id_gedung, nama, dan no_telp wajib diisi");
      return;
    }

    try {
      if (editId) {
        // Update PJ
        await axios.put(`http://localhost:5000/api/pj-gedung/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("PJ Gedung berhasil diperbarui!");
      } else {
        // Tambah PJ
        await axios.post("http://localhost:5000/api/pj-gedung", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("PJ Gedung berhasil ditambahkan!");
      }

      setForm({
        id_gedung: "",
        nama: "",
        no_telp: "",
        link_peminjaman: "",
        qrcodepath_pinjam: "",
        qrcodepath_kontak: "",
      });
      setEditId(null);
      setError("");
      fetchPJs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan PJ Gedung");
      setSuccess("");
    }
  };

  // Edit PJ Gedung
  const handleEdit = (pj) => {
    setEditId(pj.id_pj_gedung);
    setForm({
      id_gedung: pj.id_gedung,
      nama: pj.nama,
      no_telp: pj.no_telp,
      link_peminjaman: pj.link_peminjaman || "",
      qrcodepath_pinjam: pj.qrcodepath_pinjam || "",
      qrcodepath_kontak: pj.qrcodepath_kontak || "",
    });
  };

  // Hapus PJ Gedung
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus PJ Gedung ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/pj-gedung/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("PJ Gedung berhasil dihapus!");
      fetchPJs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus PJ Gedung");
    }
  };

  // Batalkan edit
  const cancelEdit = () => {
    setEditId(null);
    setForm({
      id_gedung: "",
      nama: "",
      no_telp: "",
      link_peminjaman: "",
      qrcodepath_pinjam: "",
      qrcodepath_kontak: "",
    });
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola PJ Gedung
        </h1>
      </div>

      {/* Notifications */}
      {error && <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200">{success}</div>}

      {/* Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit PJ Gedung" : "Tambah PJ Gedung Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Gedung</label>
              <select
                value={form.id_gedung}
                onChange={(e) => setForm({ ...form, id_gedung: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">-- Pilih Gedung --</option>
                {gedungs.map((g) => (
                  <option key={g.id_gedung} value={g.id_gedung}>{g.nama_gedung}</option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">No Telepon</label>
              <input
                type="text"
                placeholder="08xxxxxxx"
                value={form.no_telp}
                onChange={(e) => setForm({ ...form, no_telp: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Link Peminjaman</label>
              <input
                type="text"
                placeholder="link peminjaman (opsional)"
                value={form.link_peminjaman}
                onChange={(e) => setForm({ ...form, link_peminjaman: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">QR Pinjam</label>
              <input
                type="text"
                placeholder="path QR pinjam"
                value={form.qrcodepath_pinjam}
                onChange={(e) => setForm({ ...form, qrcodepath_pinjam: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">QR Kontak</label>
              <input
                type="text"
                placeholder="path QR kontak"
                value={form.qrcodepath_kontak}
                onChange={(e) => setForm({ ...form, qrcodepath_kontak: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
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
          <h2 className="text-xl font-semibold text-gray-300">Daftar PJ Gedung</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {pjs.length} PJ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="p-4 text-left text-gray-300 first:rounded-tl-xl first:rounded-bl-xl text-center">Nama</th>
                <th className="p-4 text-left text-gray-300 text-center">Telepon</th>
                <th className="p-4 text-left text-gray-300 text-center">Gedung</th>
                <th className="p-4 text-left text-gray-300 text-center">Link Peminjaman</th>
                <th className="p-4 text-left text-gray-300 last:rounded-tr-xl last:rounded-br-xl text-center">Aksi</th>
              </tr>
            </thead>
           <tbody>
            {pjs.length > 0 ? (
              pjs.map((pj) => (
                <tr key={pj.id_pj_gedung} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200">
                  <td className="p-4 text-gray-200 whitespace-nowrap first:rounded-tl-xl first:rounded-bl-xl text-center">{pj.nama}</td>
                  <td className="p-4 text-gray-200 whitespace-nowrap text-center">{pj.no_telp}</td>
                  <td className="p-4 text-gray-200 whitespace-nowrap text-center">{pj.nama_gedung}</td>
                  <td className="p-4 text-gray-200 max-w-[200px] truncate text-center">{pj.link_peminjaman}</td>
                  <td className="p-4 text-gray-200 space-x-2 whitespace-nowrap last:rounded-tr-xl last:rounded-br-xl text-center">
                    <button
                      onClick={() => handleEdit(pj)}
                      className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pj.id_pj_gedung)}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <User className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-lg mb-2">Tidak ada data PJ Gedung</p>
                    <p className="text-sm text-gray-500">Mulai dengan menambahkan PJ Gedung pertama Anda</p>
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
