import { useEffect, useState } from "react";
import axios from "axios";

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/riwayat", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRiwayat(res.data);
      } catch (err) {
        console.error("Error fetching riwayat:", err);
      }
    };

    fetchRiwayat();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Riwayat Kegiatan</h1>

      {/* Tabel Riwayat */}
      <section className="bg-white rounded-lg p-4 md:p-6 max-w-full overflow-x-auto shadow">
        <h2 className="font-semibold text-sm md:text-base mb-4 select-none text-black">
          Daftar Riwayat
        </h2>
        <table className="w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-black text-white text-left">
              <th className="py-2 px-3 rounded-l-md text-center">Gedung</th>
              <th className="py-2 px-3 text-center">Lantai</th>
              <th className="py-2 px-3 text-center">Ruangan</th>
              <th className="py-2 px-3 text-center">Kegiatan</th>
              <th className="py-2 px-3 text-center">Jadwal</th>
              <th className="py-2 px-3 rounded-r-md text-center">Pengguna</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {riwayat.length > 0 ? (
              riwayat.map((row) => (
                <tr key={row.id_histori} className="border-b">
                  <td className="py-2 px-3 text-center">{row.gedung || "-"}</td>
                  <td className="py-2 px-3 text-center">{row.lantai || "-"}</td>
                  <td className="py-2 px-3 text-center">{row.ruangan || "-"}</td>
                  <td className="py-2 px-3 text-center">{row.kegiatan}</td>
                  <td className="py-2 px-3 text-center">{row.jadwal}</td>
                  <td className="py-2 px-3 text-center">{row.pengguna}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Belum ada riwayat kegiatan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
