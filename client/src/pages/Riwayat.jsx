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
  Clock,
  Search,
  Filter,
  Archive,
  Activity,
  RefreshCw
} from "lucide-react";

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const token = localStorage.getItem("token");

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/riwayat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRiwayat(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching riwayat:", err);
      setError("Gagal memuat data riwayat");
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
    
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchRiwayat, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter dan search functionality
  const filteredRiwayat = riwayat.filter((item) => {
    const matchesSearch = 
      item.kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gedung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ruangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pengguna?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterCategory === "" || item.gedung === filterCategory;

    return matchesSearch && matchesFilter;
  });

  // Get unique gedung names for filter
  const uniqueGedungs = [...new Set(riwayat.map(item => item.gedung).filter(Boolean))];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full min-h-screen bg-primary text-white relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
        <div className="absolute top-96 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-80 right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute left-1/2 w-28 h-28 border border-white/15 rounded-full" style={{top: '600px'}}></div>
        <div className="absolute right-10 w-20 h-20 border border-white/15 rounded-full" style={{top: '800px'}}></div>
        <div className="absolute left-20 w-18 h-18 border border-white/15 rounded-full" style={{top: '1000px'}}></div>
        <div className="absolute left-10 w-24 h-24 border border-white/15 rounded-lg rotate-45" style={{top: '1200px'}}></div>
      </div>

      <div className="relative z-10 w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-white bg-clip-text text-transparent">
              Riwayat Agenda
            </h1>
          </div>
          <p className="text-xl text-gray-300 ml-13">
            Lihat semua riwayat kegiatan dan agenda ruangan yang telah berlangsung
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              {error}
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">Filter & Pencarian</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kegiatan, gedung, ruangan, atau pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filter Select */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 min-w-[150px]"
                >
                  <option value="">Semua Gedung</option>
                  {uniqueGedungs.map((gedung) => (
                    <option key={gedung} value={gedung}>
                      {gedung}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchRiwayat}
                disabled={loading}
                className="px-4 py-3 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-600/30 transition-all duration-200 flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {(searchTerm || filterCategory) && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                Menampilkan {filteredRiwayat.length} dari {riwayat.length} riwayat
                {searchTerm && ` yang mengandung "${searchTerm}"`}
                {filterCategory && ` di gedung ${filterCategory}`}
              </p>
            </div>
          )}
        </div>

        {/* Riwayat Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Daftar Riwayat</h2>
                <p className="text-gray-400">Semua agenda dan kegiatan yang telah selesai</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30 font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total: {filteredRiwayat.length} Riwayat
              </span>
              {loading && (
                <div className="w-6 h-6 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/30">
                  <th className="p-4 text-left text-sm font-medium text-gray-300 first:rounded-tl-xl">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Lantai
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <DoorClosed className="w-4 h-4" />
                      Ruangan
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Kegiatan
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Jadwal
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300 last:rounded-tr-xl">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Pengguna
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mb-4"></div>
                        <p className="text-lg mb-2">Memuat riwayat agenda...</p>
                        <p className="text-sm text-gray-500">Tunggu sebentar</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRiwayat.length > 0 ? (
                  filteredRiwayat.map((row, idx) => (
                    <tr
                      key={`${row.id || idx}`}
                      className="border-b border-gray-700/20 hover:bg-gray-700/20 transition-all duration-200"
                    >
                      <td className="p-4 text-gray-200 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                          {row.gedung || "-"}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 text-sm font-medium">
                          {row.lantai ? `Lantai ${row.lantai}` : "-"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                            <DoorClosed className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="font-medium">{row.ruangan || "-"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="max-w-xs">
                          <p className="font-medium truncate mb-1" title={row.kegiatan}>
                            {row.kegiatan}
                          </p>
                          {row.deskripsi && (
                            <p className="text-sm text-gray-400 truncate" title={row.deskripsi}>
                              {row.deskripsi}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-400/30 text-sm font-medium">
                              {row.jadwal || "-"}
                            </span>
                            {row.tanggal && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(row.tanggal)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-200 last:rounded-tr-xl last:rounded-br-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium">{row.pengguna}</p>
                            {row.email && (
                              <p className="text-xs text-gray-400">{row.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        {error ? (
                          <>
                            <ClipboardList className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Gagal memuat riwayat</p>
                            <p className="text-sm mb-4">Terjadi kesalahan saat mengambil data</p>
                            <button
                              onClick={fetchRiwayat}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Coba Lagi
                            </button>
                          </>
                        ) : searchTerm || filterCategory ? (
                          <>
                            <Search className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Tidak ada riwayat ditemukan</p>
                            <p className="text-sm mb-4">
                              Coba ubah kata kunci pencarian atau filter yang digunakan
                            </p>
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setFilterCategory("");
                              }}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Reset Filter
                            </button>
                          </>
                        ) : (
                          <>
                            <History className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Belum ada riwayat kegiatan</p>
                            <p className="text-sm">
                              Aktivitas yang sudah selesai akan muncul di sini
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {filteredRiwayat.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-700/20">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Menampilkan {filteredRiwayat.length} riwayat</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Selesai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Dijadwalkan</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {riwayat.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200">Total Kegiatan</h3>
              </div>
              <p className="text-3xl font-bold text-white">{riwayat.length}</p>
              <p className="text-sm text-gray-400">Kegiatan selesai</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200">Gedung Aktif</h3>
              </div>
              <p className="text-3xl font-bold text-white">{uniqueGedungs.length}</p>
              <p className="text-sm text-gray-400">Gedung dengan aktivitas</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200">Pengguna Aktif</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {[...new Set(riwayat.map(item => item.pengguna).filter(Boolean))].length}
              </p>
              <p className="text-sm text-gray-400">Pengguna terdaftar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}