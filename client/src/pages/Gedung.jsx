import { useState, useEffect } from "react";
import axios from "axios";
import { Building2, MapPin, Plus, Edit, Trash2, X } from "lucide-react";

export default function Gedung() {
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
  nama_gedung: "",
  lokasi_gedung: "Jakarta",
  pj: {
    nama: "",
    no_telp: "",
    link_peminjaman: "",
    qrcodepath_pinjam: "",
    qrcodepath_kontak: "",
  },
});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchGedungs = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/gedung", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Data gedung dari backend:", res.data); // <-- tambahkan ini
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

  try {
    if (editId) {
      await axios.put(`http://localhost:5000/api/gedung/${editId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Gedung + PJ berhasil diperbarui!");
    } else {
      await axios.post("http://localhost:5000/api/gedung", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Gedung + PJ berhasil ditambahkan!");
    }

    setForm({
      nama_gedung: "",
      lokasi_gedung: "Jakarta",
      pj: {
        nama: "",
        no_telp: "",
        link_peminjaman: "",
        qrcodepath_pinjam: "",
        qrcodepath_kontak: "",
      },
    });
    setEditId(null);
    setError("");
    fetchGedungs();
    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    console.error(err.response?.data || err.message);
    setError(err.response?.data?.message || "Gagal menyimpan gedung");
    setSuccess("");
  }
};

  const handleEdit = (g) => {
  setEditId(g.id_gedung);
  setForm({
    nama_gedung: g.nama_gedung || "",
    lokasi_gedung: g.lokasi_gedung || "Jakarta",
    pj: {
      nama: g.pj?.nama || "",
      no_telp: g.pj?.no_telp || "",
      link_peminjaman: g.pj?.link_peminjaman || "",
      qrcodepath_pinjam: g.pj?.qrcodepath_pinjam || "",
      qrcodepath_kontak: g.pj?.qrcodepath_kontak || "",
    },
  });
};


  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus gedung ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/gedung/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Gedung berhasil dihapus!");
      fetchGedungs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus gedung");
    }
  };

  const cancelEdit = () => {
  setEditId(null);
  setForm({
    nama_gedung: "",
    lokasi_gedung: "Jakarta",
    pj: {
      nama: "",
      no_telp: "",
      link_peminjaman: "",
      qrcodepath_pinjam: "",
      qrcodepath_kontak: "",
    },
  });
  setError("");
};


  return (
    <div className="w-full px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola Gedung
        </h1>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit Gedung" : "Tambah Gedung Baru"}
        </h2>

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
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
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
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="Jakarta">Jakarta</option>
                <option value="Depok">Depok</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama PJ */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nama PJ Gedung
              </label>
              <input
                type="text"
                placeholder="Masukkan nama penanggung jawab"
                value={form.pj.nama}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, nama: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                No Telepon
              </label>
              <input
                type="text"
                placeholder="08xxxxxxx"
                value={form.pj.no_telp}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, no_telp: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            {/* Link Peminjaman */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Link Peminjaman
              </label>
              <input
                type="text"
                placeholder="Masukkan link peminjaman"
                value={form.pj.link_peminjaman}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, link_peminjaman: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            {/* QR Code Peminjaman */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                QR Code Peminjaman
              </label>
              <input
                type="text"
                placeholder="Path QR Code"
                value={form.pj.qrcodepath_pinjam}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, qrcodepath_pinjam: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            {/* QR Code Kontak */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                QR Code Kontak
              </label>
              <input
                type="text"
                placeholder="Path QR Code"
                value={form.pj.qrcodepath_kontak}
                onChange={(e) => setForm({ ...form, pj: { ...form.pj, qrcodepath_kontak: e.target.value } })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
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
              <Plus className="w-5 h-5" /> {editId ? "Update Gedung" : "Tambah Gedung"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
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
              <tr className="bg-gray-700/50">
                <th className="p-4 text-left text-gray-300 text-center first:rounded-tl-xl first:rounded-bl-xl">Nama Gedung</th>
                <th className="p-4 text-left text-gray-300 text-center">Lokasi</th>
                <th className="p-4 text-left text-gray-300 text-center">PJ Gedung</th>
                <th className="p-4 text-left text-gray-300 text-center">No Telepon</th>
                <th className="p-4 text-center text-gray-300 last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {gedungs.length > 0 ? (
                gedungs.map((g) => (
                  <tr key={g.id_gedung} className="border-b border-gray-700/30 hover:bg-gray-700/30">
                    <td className="p-4 text-gray-200 text-center first:rounded-tl-xl first:rounded-bl-xl">{g.nama_gedung}</td>
                    <td className="p-4 text-gray-200 text-center">{g.lokasi_gedung}</td>
                    <td className="p-4 text-gray-200 text-center">{g.pj?.nama || "-"}</td>
                    <td className="p-4 text-gray-200 text-center">{g.pj?.no_telp || "-"}</td>
                    <td className="p-4 text-center space-x-2 last:rounded-tr-xl last:rounded-br-xl">
                      <button
                        onClick={() => handleEdit(g)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        <Edit className="inline w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(g.id_gedung)}
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
                    Tidak ada data gedung
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
