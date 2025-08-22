import { useState, useEffect } from "react";
import axios from "axios";

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

  const token = localStorage.getItem("token");

  const fetchKegiatans = async () => {
    if (!token) return setError("Token tidak tersedia.");
    try {
      const res = await axios.get("http://localhost:5000/api/kegiatan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKegiatans(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data kegiatan");
    }
  };

  const fetchRuangans = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/ruangan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRuangans(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchKegiatans();
    fetchRuangans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("Token tidak tersedia.");

    try {
      if (editId) {
        // Update
        await axios.put(`http://localhost:5000/api/kegiatan/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Tambah
        await axios.post("http://localhost:5000/api/kegiatan", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ id_ruangan: "", nama_kegiatan: "", deskripsi_kegiatan: "", pengguna: "" });
      setEditId(null);
      fetchKegiatans();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan kegiatan");
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
      fetchKegiatans();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Gagal menghapus kegiatan");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Kelola Kegiatan</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Form tambah / edit kegiatan */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 p-4 border rounded-lg shadow-md mb-6"
      >
        <select
          value={form.id_ruangan}
          onChange={(e) => setForm({ ...form, id_ruangan: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Pilih Ruangan</option>
          {ruangans.map((r) => (
            <option key={r.id_ruangan} value={r.id_ruangan}>
              {r.nama_gedung} - Lantai {r.nomor_lantai} - {r.nama_ruangan}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nama Kegiatan"
          value={form.nama_kegiatan}
          onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Deskripsi Kegiatan"
          value={form.deskripsi_kegiatan}
          onChange={(e) => setForm({ ...form, deskripsi_kegiatan: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        <input
          type="text"
          placeholder="Pengguna"
          value={form.pengguna}
          onChange={(e) => setForm({ ...form, pengguna: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          {editId ? "Simpan Perubahan" : "Tambah Kegiatan"}
        </button>
      </form>

      {/* Tabel daftar kegiatan */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border text-black">Gedung</th>
            <th className="p-2 border text-black">Lantai</th>
            <th className="p-2 border text-black">Ruangan</th>
            <th className="p-2 border text-black">Nama Kegiatan</th>
            <th className="p-2 border text-black">Deskripsi</th>
            <th className="p-2 border text-black">Pengguna</th>
            <th className="p-2 border text-black">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {kegiatans.length > 0 ? (
            kegiatans.map((k) => (
              <tr key={k.id_kegiatan}>
                <td className="p-2 border text-center">{k.nama_gedung}</td>
                <td className="p-2 border text-center">{k.nomor_lantai}</td>
                <td className="p-2 border text-center">{k.nama_ruangan}</td>
                <td className="p-2 border text-center">{k.nama_kegiatan}</td>
                <td className="p-2 border text-center">{k.deskripsi_kegiatan}</td>
                <td className="p-2 border text-center">{k.pengguna}</td>
                <td className="p-2 border text-center space-x-2">
                  <button
                    onClick={() => handleEdit(k)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(k.id_kegiatan)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-2 text-center">
                Tidak ada data kegiatan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
