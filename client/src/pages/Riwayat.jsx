import { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2,
  Layers,
  DoorClosed,
  ClipboardList,
  CalendarDays,
  User,
  History,
} from "lucide-react";

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
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <History className="w-7 h-7 text-gray-800 dark:text-gray-200" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Riwayat Kegiatan
        </h1>
      </div>

      {/* Riwayat Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-300">Daftar Riwayat</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {riwayat.length} Kegiatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 backdrop-blur-sm">
                <th className="p-4 text-left text-gray-300 font-medium">
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
                <th className="p-4 text-left text-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Jadwal
                  </div>
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Pengguna
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200"
                  >
                    <td className="p-4 text-gray-200">{row.gedung || "-"}</td>
                    <td className="p-4 text-gray-200">{row.lantai || "-"}</td>
                    <td className="p-4 text-gray-200">{row.ruangan || "-"}</td>
                    <td className="p-4 text-gray-200">{row.kegiatan}</td>
                    <td className="p-4 text-gray-200">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        {row.jadwal}
                      </span>
                    </td>
                    <td className="p-4 text-gray-200">{row.pengguna}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <History className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-lg mb-2">Belum ada riwayat kegiatan</p>
                      <p className="text-sm text-gray-500">
                        Aktivitas yang sudah selesai akan muncul di sini
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
