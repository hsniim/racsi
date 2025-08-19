import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalGedung: 0,
    totalLantai: 0,
    totalRuangan: 0,
  });
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats({
          totalGedung: res.data.totalGedung || 0,
          totalLantai: res.data.totalLantai || 0,
          totalRuangan: res.data.totalRuangan || 0,
        });

        setUpdates(res.data.rooms || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Stats Cards */}
      <section className="flex flex-wrap gap-4 mb-8">
        <div className="bg-black text-white rounded-lg p-4 w-[140px] md:w-[180px]">
          <div className="flex items-center gap-2 font-semibold text-sm md:text-base mb-1">
            <i className="fas fa-building"></i>
            <span>Total Gedung</span>
          </div>
          <div className="text-lg md:text-xl font-bold select-none">
            {stats.totalGedung}
          </div>
        </div>
        <div className="bg-black text-white rounded-lg p-4 w-[140px] md:w-[180px]">
          <div className="flex items-center gap-2 font-semibold text-sm md:text-base mb-1">
            <i className="fas fa-chart-bar"></i>
            <span>Total Lantai</span>
          </div>
          <div className="text-lg md:text-xl font-bold select-none">
            {stats.totalLantai}
          </div>
        </div>
        <div className="bg-black text-white rounded-lg p-4 w-[140px] md:w-[180px]">
          <div className="flex items-center gap-2 font-semibold text-sm md:text-base mb-1">
            <i className="fas fa-columns"></i>
            <span>Total Ruangan</span>
          </div>
          <div className="text-lg md:text-xl font-bold select-none">
            {stats.totalRuangan}
          </div>
        </div>
      </section>

      {/* Updates Table */}
      <section className="bg-white rounded-lg p-4 md:p-6 max-w-full overflow-x-auto shadow">
        <h2 className="font-semibold text-sm md:text-base mb-4 select-none">
          Pembaruan Terkini
        </h2>
        <table className="w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-black text-white text-left">
              <th className="py-2 px-3 rounded-l-md">Gedung</th>
              <th className="py-2 px-3">Lantai</th>
              <th className="py-2 px-3">Ruangan</th>
              <th className="py-2 px-3">Kegiatan</th>
              <th className="py-2 px-3 rounded-r-md">Jadwal</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {updates.length > 0 ? (
              updates.map((room, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-3">{room.gedung}</td>
                  <td className="py-2 px-3 text-center">{room.lantai}</td>
                  <td className="py-2 px-3 text-center">{room.nama}</td>
                  <td className="py-2 px-3">{room.kegiatan}</td>
                  <td className="py-2 px-3">{room.jadwal}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Tidak ada data terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}