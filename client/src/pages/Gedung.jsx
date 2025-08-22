import { useState, useEffect } from "react";
import axios from "axios";

export default function Gedung() {
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    nama_gedung: "",
    lokasi_gedung: "Jakarta", // default Jakarta
    pj_gedung: "",
  });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchGedungs = async () => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Jika backend mengirim { data: [...] }
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

    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/gedung", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ nama_gedung: "", lokasi_gedung: "Jakarta", pj_gedung: "" });
      fetchGedungs(); // refresh daftar gedung
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menambahkan gedung");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Kelola Gedung:</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Form tambah gedung */}
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
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Tambah Gedung
        </button>
      </form>

      {/* Tabel daftar gedung */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border text-black">Nama</th>
            <th className="p-2 border text-black">Lokasi</th>
            <th className="p-2 border text-black">PJ</th>
          </tr>
        </thead>
        <tbody>
          {gedungs.length > 0 ? (
            gedungs.map((g) => (
              <tr key={g.id_gedung || g.id}>
                <td className="p-2 border text-center">{g.nama_gedung}</td>
                <td className="p-2 border text-center">{g.lokasi_gedung}</td>
                <td className="p-2 border text-center">{g.pj_gedung}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-2 text-center">
                Tidak ada data gedung
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
