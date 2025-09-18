import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, X, Star } from "lucide-react";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [ruangans, setRuangans] = useState([]); // ✅ simpan list ruangan
  const [form, setForm] = useState({
    id_ruangan: "",
    nama_pengguna: "",
    email_pengguna: "",
    rating: 5,
    komentar: "",
    kategori: "",
    tanggal_feedback: "",
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
      console.error("Gagal fetch ruangan:", err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data feedback");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchRuangans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/feedback/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Feedback berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/feedback", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Feedback berhasil ditambahkan!");
      }

      setForm({
        id_ruangan: "",
        nama_pengguna: "",
        email_pengguna: "",
        rating: 5,
        komentar: "",
        kategori: "",
        tanggal_feedback: "",
      });
      setEditId(null);
      setError("");
      fetchFeedbacks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan feedback");
      setSuccess("");
    }
  };

  const handleEdit = (f) => {
    setEditId(f.id_feedback);
    setForm({
      id_ruangan: f.id_ruangan || "",
      nama_pengguna: f.nama_pengguna || "",
      email_pengguna: f.email_pengguna || "",
      rating: f.rating || 5,
      komentar: f.komentar || "",
      kategori: f.kategori || "",
      tanggal_feedback: f.tanggal_feedback
        ? f.tanggal_feedback.split("T")[0]
        : "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus feedback ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Feedback berhasil dihapus!");
      fetchFeedbacks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus feedback");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      id_ruangan: "",
      nama_pengguna: "",
      email_pengguna: "",
      rating: 5,
      komentar: "",
      kategori: "",
      tanggal_feedback: "",
    });
    setError("");
  };

  const getNamaRuangan = (id) => {
  const r = ruangans.find((item) => item.id_ruangan === id);
  return r ? `${r.nama_gedung} - Lt ${r.nomor_lantai} - ${r.nama_ruangan}` : id;
};


  return (
    <div className="w-full px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Kelola Feedback</h1>
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
      <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit Feedback" : "Tambah Feedback Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
  <label className="block text-sm text-gray-400 mb-2">Pilih Ruangan</label>
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
              <label className="block text-sm text-gray-400 mb-2">
                Tanggal Feedback
              </label>
              <input
                type="date"
                value={form.tanggal_feedback}
                onChange={(e) =>
                  setForm({ ...form, tanggal_feedback: e.target.value })
                }
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Nama Pengguna
              </label>
              <input
                type="text"
                placeholder="Masukkan nama pengguna"
                value={form.nama_pengguna}
                onChange={(e) =>
                  setForm({ ...form, nama_pengguna: e.target.value })
                }
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={form.email_pengguna}
                onChange={(e) =>
                  setForm({ ...form, email_pengguna: e.target.value })
                }
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Rating</label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Kategori
              </label>
              <select
                value={form.kategori}
                onChange={(e) =>
                  setForm({ ...form, kategori: e.target.value })
                }
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="fasilitas">Fasilitas</option>
                <option value="kebersihan">Kebersihan</option>
                <option value="kenyamanan">Kenyamanan</option>
                <option value="pelayanan">Pelayanan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Komentar</label>
            <textarea
              placeholder="Tulis komentar"
              value={form.komentar}
              onChange={(e) => setForm({ ...form, komentar: e.target.value })}
              className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
              rows="3"
              required
            />
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
              <Plus className="w-5 h-5" />{" "}
              {editId ? "Update Feedback" : "Tambah Feedback"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">
            Daftar Feedback
          </h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {feedbacks.length} Feedback
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="p-4 text-gray-300 text-center first:rounded-tl-xl first:rounded-bl-xl">Ruangan</th>
                <th className="p-4 text-gray-300 text-center">Tanggal</th>
                <th className="p-4 text-gray-300 text-center">Nama</th>
                <th className="p-4 text-gray-300 text-center">Email</th>
                <th className="p-4 text-gray-300 text-center">Rating</th>
                <th className="p-4 text-gray-300 text-center">Kategori</th>
                <th className="p-4 text-gray-300 text-center">Komentar</th>
                <th className="p-4 text-gray-300 text-center last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length > 0 ? (
                feedbacks.map((f) => (
                  <tr
                    key={f.id_feedback}
                    className="border-b border-gray-700/30 hover:bg-gray-700/30">
                    <td className="p-4 text-gray-200 text-center first:rounded-tl-xl first:rounded-bl-xl">{getNamaRuangan(f.id_ruangan)}</td>
                    <td className="p-4 text-gray-200 text-center">
                      {f.tanggal_feedback
                        ? new Date(f.tanggal_feedback).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </td>
                    <td className="p-4 text-gray-200 text-center">
                      {f.nama_pengguna}
                    </td>
                    <td className="p-4 text-gray-200 text-center">
                      {f.email_pengguna}
                    </td>
                    <td className="p-4 text-gray-200 text-center flex justify-center">
                      {Array.from({ length: f.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                        />
                      ))}
                    </td>
                    <td className="p-4 text-gray-200 text-center">
                      {f.kategori || "-"}
                    </td>
                    <td className="p-4 text-gray-200 text-center">
                      {f.komentar}
                    </td>
                    <td className="p-4 text-center space-x-2 last:rounded-tr-xl last:rounded-br-xl">
                      <button
                        onClick={() => handleEdit(f)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        <Edit className="inline w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id_feedback)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                      >
                        <Trash2 className="inline w-4 h-4 mr-1" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    Tidak ada data feedback
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