import { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Layers, DoorOpen, DoorClosed, ClipboardList, CalendarDays } from "lucide-react";

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
<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold text-gray-300">Pembaruan Terkini</h2>
    <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
      {updates.length} Update
    </span>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-700/50 backdrop-blur-sm">
          <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Gedung
            </div>
          </th>
          <th className="p-4 text-left text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> Lantai
            </div>
          </th>
          <th className="p-4 text-left text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <DoorClosed className="w-4 h-4" /> Ruangan
            </div>
          </th>
          <th className="p-4 text-left text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Kegiatan
            </div>
          </th>
          <th className="p-4 text-left text-gray-300 font-medium last:rounded-tr-xl last:rounded-br-xl">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Jadwal
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {updates.length > 0 ? (
          updates.map((room, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200"
            >
              <td className="p-4 text-gray-200">{room.gedung}</td>
              <td className="p-4 text-gray-200">{room.lantai}</td>
              <td className="p-4 text-gray-200">{room.nama}</td>
              <td className="p-4 text-gray-200">{room.kegiatan}</td>
              <td className="p-4 text-gray-200">{room.jadwal}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="p-8 text-center text-gray-400">
              <div className="flex flex-col items-center">
                <DoorOpen className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-lg mb-2">Tidak ada pembaruan terbaru</p>
                <p className="text-sm text-gray-500">Kegiatan terbaru akan muncul di sini</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

    </>
  );
}
