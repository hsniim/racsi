import { useEffect, useState } from "react";
import axios from "axios";

export default function Jadwal() {
  const [jadwals, setJadwals] = useState([]);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [form, setForm] = useState({
    id_kegiatan: "",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
  });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Ambil semua kegiatan untuk dropdown
  const fetchKegiatan = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/kegiatan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKegiatanList(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const fetchJadwals = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/jadwal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJadwals(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchKegiatan();
    fetchJadwals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token tidak tersedia. Silakan login terlebih dahulu.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/jadwal", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ id_kegiatan: "", tanggal: "", waktu_mulai: "", waktu_selesai: "" });
      fetchJadwals(); // refresh daftar jadwal
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menambahkan jadwal");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Kelola Jadwal</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {/* Form tambah jadwal */}
      <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg shadow-md mb-6">
        {/* Dropdown Kegiatan */}
        <select
          value={form.id_kegiatan}
          onChange={(e) => setForm({ ...form, id_kegiatan: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">-- Pilih Kegiatan --</option>
          {kegiatanList.map((k) => (
            <option key={k.id_kegiatan} value={k.id_kegiatan}>
              {k.nama_kegiatan}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.tanggal}
          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="time"
          value={form.waktu_mulai}
          onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="time"
          value={form.waktu_selesai}
          onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <button type="submit" className="bg-gray-600 text-white px-4 py-2 rounded">
          Tambah Jadwal
        </button>
      </form>

      {/* Tabel daftar jadwal */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border text-black">Kegiatan</th>
            <th className="p-2 border text-black">Tanggal</th>
            <th className="p-2 border text-black">Waktu Mulai</th>
            <th className="p-2 border text-black">Waktu Selesai</th>
          </tr>
        </thead>
        <tbody>
          {jadwals.length > 0 ? (
            jadwals.map((j) => (
              <tr key={j.id_jadwal}>
                <td className="p-2 border text-center">{j.nama_kegiatan}</td>
                <td className="p-2 border text-center">{j.tanggal}</td>
                <td className="p-2 border text-center">{j.waktu_mulai}</td>
                <td className="p-2 border text-center">{j.waktu_selesai}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-2 text-center">
                Tidak ada data jadwal
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
