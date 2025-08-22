import { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Layers, DoorOpen } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalGedung: 0,
    totalLantai: 0,
    totalRuangan: 0,
  });
  const [updates, setUpdates] = useState([]);

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

  useEffect(() => {
    // Fetch pertama kali
    fetchData();

    // Refresh otomatis setiap 5 detik
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    // Bersihkan interval saat komponen unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <>
 {/* Stats Cards */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
  <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-300">
    <div className="flex items-center gap-3 font-semibold text-base md:text-lg mb-2">
      <Building2 className="w-8 h-8" />
      <span>Total Gedung</span>
    </div>
    <div className="text-3xl md:text-4xl font-extrabold select-none tracking-wide">
      {stats.totalGedung}
    </div>
  </div>

  <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-300">
    <div className="flex items-center gap-3 font-semibold text-base md:text-lg mb-2">
      <Layers className="w-8 h-8" />
      <span>Total Lantai</span>
    </div>
    <div className="text-3xl md:text-4xl font-extrabold select-none tracking-wide">
      {stats.totalLantai}
    </div>
  </div>

  <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-300">
    <div className="flex items-center gap-3 font-semibold text-base md:text-lg mb-2">
      <DoorOpen className="w-8 h-8" />
      <span>Total Ruangan</span>
    </div>
    <div className="text-3xl md:text-4xl font-extrabold select-none tracking-wide">
      {stats.totalRuangan}
    </div>
  </div>
</section>


      {/* Updates Table */}
      <section className="bg-white rounded-lg p-4 md:p-6 max-w-full overflow-x-auto shadow">
        <h2 className="font-semibold text-sm md:text-base mb-4 select-none text-black">
          Pembaruan Terkini
        </h2>
        <table className="w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-black text-white text-left">
              <th className="py-2 px-3 rounded-l-md text-center">Gedung</th>
              <th className="py-2 px-3 text-center">Lantai</th>
              <th className="py-2 px-3 text-center">Ruangan</th>
              <th className="py-2 px-3 text-center">Kegiatan</th>
              <th className="py-2 px-3 rounded-r-md text-center">Jadwal</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {updates.length > 0 ? (
              updates.map((room, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-3 text-center">{room.gedung}</td>
                  <td className="py-2 px-3 text-center">{room.lantai}</td>
                  <td className="py-2 px-3 text-center">{room.nama}</td>
                  <td className="py-2 px-3 text-center">{room.kegiatan}</td>
                  <td className="py-2 px-3 text-center">{room.jadwal}</td>
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
