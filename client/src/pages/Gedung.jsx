import { useState, useEffect } from "react";
import axios from "axios";

export default function Gedung() {
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    nama_gedung: "",
    lokasi_gedung: "Jakarta",
    pj_gedung: "",
  });
  const [editId, setEditId] = useState(null); // untuk edit
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Ambil semua gedung
  const fetchGedungs = async () => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGedungs(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data gedung");
    }
  };

  useEffect(() => {
    fetchGedungs();
  }, []);

  // Tambah atau update gedung
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/gedung/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/gedung", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ nama_gedung: "", lokasi_gedung: "Jakarta", pj_gedung: "" });
      fetchGedungs();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan gedung");
    }
  };

  // Hapus gedung
  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Yakin ingin menghapus gedung ini?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/gedung/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGedungs();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus gedung");
    }
  };

  // Isi form untuk edit
  const handleEdit = (g) => {
    setForm({
      nama_gedung: g.nama_gedung,
      lokasi_gedung: g.lokasi_gedung,
      pj_gedung: g.pj_gedung,
    });
    setEditId(g.id_gedung || g.id);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manajemen Gedung</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Form tambah / edit gedung */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 p-4 border rounded-lg shadow-md mb-6"
      >
        <input
          type="text"
          placeholder="Nama Gedung"
          value={form.nama_gedung}
          onChange={(e) => setForm({ ...form, nama_gedung: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        {/* Dropdown Lokasi */}
        <select
          value={form.lokasi_gedung}
          onChange={(e) => setForm({ ...form, lokasi_gedung: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="Jakarta">Jakarta</option>
          <option value="Depok">Depok</option>
        </select>

        <input
          type="text"
          placeholder="Penanggung Jawab"
          value={form.pj_gedung}
          onChange={(e) => setForm({ ...form, pj_gedung: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          {editId ? "Update Gedung" : "Tambah Gedung"}
        </button>
      </form>

      {/* Tabel daftar gedung */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nama Gedung</th>
            <th className="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {gedungs.length > 0 ? (
            gedungs.map((g) => (
              <tr key={g.id_gedung || g.id}>
                <td className="p-2 border">{g.nama_gedung}</td>
                <td className="p-2 border space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(g)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(g.id_gedung || g.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="p-2 text-center">
                Tidak ada data gedung
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
