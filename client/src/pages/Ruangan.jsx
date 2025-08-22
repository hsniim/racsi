import { useState, useEffect } from "react";
import axios from "axios";

export default function Ruangan() {
  const [ruangans, setRuangans] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [form, setForm] = useState({
    id_lantai: "",
    nama_ruangan: "",
    kapasitas: "",
    status: "tidak_digunakan",
  });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Ambil daftar ruangan
  const fetchRuangans = async () => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }
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

  // Ambil daftar lantai untuk dropdown
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

  // Tambah ruangan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/ruangan", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ id_lantai: "", nama_ruangan: "", kapasitas: "", status: "tidak_digunakan" });
      fetchRuangans();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menambahkan ruangan");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Kelola Ruangan</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Form tambah ruangan */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 p-4 border rounded-lg shadow-md mb-6"
      >
        <select
          value={form.id_lantai}
          onChange={(e) => setForm({ ...form, id_lantai: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Pilih Lantai</option>
          {lantais.map((l) => (
            <option key={l.id_lantai} value={l.id_lantai}>
              {l.nama_gedung} - Lantai {l.nomor_lantai}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nama Ruangan"
          value={form.nama_ruangan}
          onChange={(e) => setForm({ ...form, nama_ruangan: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Kapasitas"
          value={form.kapasitas}
          onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="tidak_digunakan">Tidak Digunakan</option>
          <option value="digunakan">Digunakan</option>
        </select>

        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Tambah Ruangan
        </button>
      </form>

      {/* Tabel daftar ruangan */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border text-black">Gedung</th>
            <th className="p-2 border text-black">Lantai</th>
            <th className="p-2 border text-black">Nama Ruangan</th>
            <th className="p-2 border text-black">Kapasitas</th>
          </tr>
        </thead>
        <tbody>
          {ruangans.length > 0 ? (
            ruangans.map((r) => (
              <tr key={r.id_ruangan || r.id}>
                <td className="p-2 border text-center">{r.nama_gedung}</td>
                <td className="p-2 border text-center">{r.nomor_lantai}</td>
                <td className="p-2 border text-center">{r.nama_ruangan}</td>
                <td className="p-2 border text-center">{r.kapasitas}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-2 text-center">
                Tidak ada data ruangan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
