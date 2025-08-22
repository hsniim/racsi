import { useState, useEffect } from "react";
import axios from "axios";

export default function Lantai() {
  const [lantais, setLantais] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    id_gedung: "",
    nomor_lantai: "",
    pj_lantaipagi: "",
    pj_lantaisiang: "",
  });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Ambil daftar lantai
  const fetchLantais = async () => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }
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

  // Ambil daftar gedung untuk dropdown
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

  // Tambah lantai
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/lantai", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ id_gedung: "", nomor_lantai: "", pj_lantaipagi: "", pj_lantaisiang: "" });
      fetchLantais();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menambahkan lantai");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Kelola Lantai</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Form tambah lantai */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 p-4 border rounded-lg shadow-md mb-6"
      >
        <select
          value={form.id_gedung}
          onChange={(e) => setForm({ ...form, id_gedung: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Pilih Gedung</option>
          {gedungs.map((g) => (
            <option key={g.id_gedung} value={g.id_gedung}>
              {g.nama_gedung}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Lantai"
          value={form.nomor_lantai}
          onChange={(e) => setForm({ ...form, nomor_lantai: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="PJ Pagi"
          value={form.pj_lantaipagi}
          onChange={(e) => setForm({ ...form, pj_lantaipagi: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="PJ Siang"
          value={form.pj_lantaisiang}
          onChange={(e) => setForm({ ...form, pj_lantaisiang: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Tambah Lantai
        </button>
      </form>

      {/* Tabel daftar lantai */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border text-black">Gedung</th>
            <th className="p-2 border text-black">Lantai</th>
            <th className="p-2 border text-black">PJ Pagi</th>
            <th className="p-2 border text-black">PJ Siang</th>
          </tr>
        </thead>
        <tbody>
          {lantais.length > 0 ? (
            lantais.map((l) => (
              <tr key={l.id_lantai || l.id}>
                <td className="p-2 border text-center">{l.nama_gedung}</td>
                <td className="p-2 border text-center">{l.nomor_lantai}</td>
                <td className="p-2 border text-center">{l.pj_lantaipagi}</td>
                <td className="p-2 border text-center">{l.pj_lantaisiang}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-2 text-center">
                Tidak ada data lantai
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
