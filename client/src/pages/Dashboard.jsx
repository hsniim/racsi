import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Building2, 
  Layers, 
  DoorOpen, 
  DoorClosed, 
  ClipboardList, 
  CalendarDays, 
  Eye, 
  Monitor,
  Plus,
  Save,
  Trash2,
  Edit,
  X,
  ChevronDown,
  TrendingUp,
  Activity,
  Users
} from "lucide-react";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  
  // States untuk statistik dan updates (existing)
  const [stats, setStats] = useState({
    totalGedung: 0,
    totalLantai: 0,
    totalRuangan: 0,
  });
  const [updates, setUpdates] = useState([]);
  const [gedungLantaiList, setGedungLantaiList] = useState([]);

  // States untuk device management (dari TvDevice.jsx)
  const [devices, setDevices] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [filteredLantais, setFilteredLantais] = useState([]);
  const [deviceForm, setDeviceForm] = useState({
    id_gedung: "",
    id_lantai: "",
    nama_device: ""
  });
  const [editDeviceId, setEditDeviceId] = useState(null);
  const [deviceMsg, setDeviceMsg] = useState({ type: "", text: "" });

  // State untuk mengontrol tampilan section
  const [showDeviceSection, setShowDeviceSection] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  // Existing functions (keeping all the existing logic)
  const fetchData = async () => {
    try {
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

  const fetchGedungLantaiList = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/gedung-lantai-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGedungLantaiList(res.data || []);
    } catch (err) {
      console.error("Error fetching gedung lantai list:", err);
    }
  };

  const loadDeviceData = async (preserveFilter = false) => {
    try {
      const [d, g, l] = await Promise.all([
        api.get("/tv-device"),
        api.get("/gedung"),
        api.get("/lantai"),
      ]);
      setDevices(d.data.data || []);
      setGedungs(g.data.data || []);
      setLantais(l.data.data || []);
      
      if (!preserveFilter && !deviceForm.id_gedung) {
        setFilteredLantais([]);
      }
    } catch (error) {
      console.error("Error loading device data:", error);
      setDeviceMsg({ type: "error", text: "Gagal memuat data device" });
    }
  };

  const handleGedungChange = (e) => {
    const selectedGedungId = e.target.value;
    
    setDeviceForm({ 
      ...deviceForm, 
      id_gedung: selectedGedungId, 
      id_lantai: "",
      nama_device: selectedGedungId ? `Device-${selectedGedungId}` : ""
    });
    
    if (selectedGedungId) {
      const filtered = lantais.filter(l => String(l.id_gedung) === String(selectedGedungId));
      setFilteredLantais(filtered);
    } else {
      setFilteredLantais([]);
    }
  };

  const handleLantaiChange = (e) => {
    const selectedLantaiId = e.target.value;
    const selectedLantai = filteredLantais.find(l => String(l.id_lantai) === String(selectedLantaiId));
    
    setDeviceForm({ 
      ...deviceForm, 
      id_lantai: selectedLantaiId,
      nama_device: selectedLantaiId ? `Device-${deviceForm.id_gedung}-L${selectedLantai?.nomor_lantai || selectedLantaiId}` : deviceForm.nama_device
    });
  };

  const submitDevice = async (e) => {
    e.preventDefault();
    
    if (!deviceForm.id_gedung || !deviceForm.id_lantai) {
      setDeviceMsg({ type: "error", text: "Harap pilih gedung dan lantai" });
      return;
    }
    
    try {
      const submitData = {
        id_gedung: deviceForm.id_gedung,
        id_lantai: deviceForm.id_lantai,
        nama_device: deviceForm.nama_device || `Device-${deviceForm.id_gedung}-${deviceForm.id_lantai}`
      };
      
      if (editDeviceId) {
        await api.put(`/tv-device/${editDeviceId}`, submitData);
        setDeviceMsg({ type: "success", text: "Device berhasil diperbarui" });
      } else {
        await api.post("/tv-device", submitData);
        setDeviceMsg({ type: "success", text: "Device berhasil ditambahkan" });
      }
      
      setDeviceForm({ id_gedung: "", id_lantai: "", nama_device: "" });
      setEditDeviceId(null);
      setFilteredLantais([]);
      setShowDeviceSection(false);
      await loadDeviceData();
      
      setTimeout(() => setDeviceMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Gagal menyimpan";
      setDeviceMsg({ type: "error", text: errorMessage });
    }
  };

  const editDevice = (d) => {
    setEditDeviceId(d.id_device);
    setDeviceForm({
      id_gedung: String(d.id_gedung),
      id_lantai: String(d.id_lantai),
      nama_device: d.nama_device || `Device-${d.id_gedung}-${d.id_lantai}`
    });
    
    if (d.id_gedung) {
      const filtered = lantais.filter(l => String(l.id_gedung) === String(d.id_gedung));
      setFilteredLantais(filtered);
    }
  };

  const hapusDevice = async (id) => {
    if (!confirm("Hapus device ini?")) return;
    try {
      await api.delete(`/tv-device/${id}`);
      await loadDeviceData();
      setDeviceMsg({ type: "success", text: "Device berhasil dihapus" });
      setTimeout(() => setDeviceMsg({ type: "", text: "" }), 4000);
    } catch (error) {
      console.error("Delete error:", error);
      setDeviceMsg({ type: "error", text: "Gagal menghapus device" });
      setTimeout(() => setDeviceMsg({ type: "", text: "" }), 4000);
    }
  };

  const batalEdit = () => {
    setEditDeviceId(null);
    setDeviceForm({ id_gedung: "", id_lantai: "", nama_device: "" });
    setFilteredLantais([]);
  };

  const handleTampilkan = (idGedung, idLantai) => {
    window.open(`/admin/room-info/${idGedung}/${idLantai}`, '_blank');
  };

  const handleTampilkanDevice = (idGedung, idLantai) => {
    window.open(`/tv_device/${idGedung}/${idLantai}`, "_blank");
  };

  useEffect(() => {
    fetchData();
    fetchGedungLantaiList();
    loadDeviceData();

    const interval = setInterval(() => {
      fetchData();
      fetchGedungLantaiList();
      loadDeviceData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            Dashboard Admin
          </h1>
          <p className="text-xl text-gray-300">
            Kelola sistem RACSI dengan mudah dan efisien
          </p>
        </div>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300">Total Gedung</h3>
                <p className="text-3xl font-bold text-white">{stats.totalGedung}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Tersedia</span>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300">Total Lantai</h3>
                <p className="text-3xl font-bold text-white">{stats.totalLantai}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-400">
              <Activity className="w-4 h-4 mr-1" />
              <span>Aktif</span>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <DoorOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300">Total Ruangan</h3>
                <p className="text-3xl font-bold text-white">{stats.totalRuangan}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-400">
              <Users className="w-4 h-4 mr-1" />
              <span>Siap Digunakan</span>
            </div>
          </div>
        </section>

        {/* Device Management Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Kelola Tampilan</h2>
                <p className="text-gray-400">Atur tampilan untuk setiap lantai/gedung</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30">
                {devices.length} Tampilan
              </span>
              <button
                onClick={() => setShowDeviceSection(!showDeviceSection)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {showDeviceSection ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showDeviceSection ? 'Tutup Form' : 'Tambah Tampilan'}
              </button>
            </div>
          </div>

          {/* Device Form - Collapsible */}
          {showDeviceSection && (
            <div className="mb-8">
              {deviceMsg.text && (
                <div className={`mb-6 p-4 rounded-xl border ${
                  deviceMsg.type === "success" 
                    ? "bg-green-600/20 border-green-400/30 text-green-200" 
                    : "bg-red-600/20 border-red-400/30 text-red-200"
                }`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-current rounded-full mr-3 animate-pulse"></div>
                    {deviceMsg.text}
                  </div>
                </div>
              )}

              <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-lg text-gray-200 font-medium mb-6 flex items-center gap-2">
                  {editDeviceId ? <Edit className="w-5 h-5 text-yellow-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
                  {editDeviceId ? "Edit Tampilan" : "Tambah Tampilan Baru"}
                </h3>
                <form onSubmit={submitDevice} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Pilih Gedung *
                      </label>
                      <div className="relative">
                        <select
                          className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                          value={deviceForm.id_gedung}
                          onChange={handleGedungChange}
                          required
                        >
                          <option value="">-- Pilih Gedung --</option>
                          {gedungs.map(g => 
                            <option key={g.id_gedung} value={g.id_gedung}>{g.nama_gedung}</option>
                          )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Pilih Lantai *
                      </label>
                      <div className="relative">
                        <select
                          className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
                          value={deviceForm.id_lantai}
                          onChange={handleLantaiChange}
                          required
                          disabled={!deviceForm.id_gedung}
                        >
                          <option value="">
                            {!deviceForm.id_gedung ? "-- Pilih Gedung Dulu --" : "-- Pilih Lantai --"}
                          </option>
                          {filteredLantais.map(l => (
                            <option key={l.id_lantai} value={l.id_lantai}>
                              Lantai {l.nomor_lantai}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {deviceForm.id_gedung && filteredLantais.length === 0 && (
                        <p className="text-sm text-yellow-400 mt-2">
                          Tidak ada lantai tersedia untuk gedung ini
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    {editDeviceId ? (
                      <>
                        <button
                          type="button"
                          onClick={batalEdit}
                          className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-400/30 rounded-xl flex items-center gap-2 hover:bg-red-600/30 transition-all duration-200 hover:shadow-lg"
                        >
                          <X className="w-5 h-5" />
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Save className="w-5 h-5" />
                          Simpan Perubahan
                        </button>
                      </>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5" />
                        Tambah Tampilan
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Device List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      ID Tampilan
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Lantai
                    </div>
                  </th>
                  <th className="p-4 text-center text-gray-300 font-medium last:rounded-tr-xl last:rounded-br-xl">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {devices.length ? devices.map(d => (
                  <tr key={d.id_device} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200">
                    <td className="p-4 text-gray-200 font-medium">#{d.id_device}</td>
                    <td className="p-4 text-gray-200">{d.nama_gedung}</td>
                    <td className="p-4 text-gray-200">Lantai {d.nomor_lantai}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => editDevice(d)}
                          className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-200 text-sm flex items-center gap-1 hover:shadow-lg"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => hapusDevice(d.id_device)}
                          className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-200 text-sm flex items-center gap-1 hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                        <button
                          onClick={() => handleTampilkanDevice(d.id_gedung, d.id_lantai)}
                          className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-200 text-sm flex items-center gap-1 hover:shadow-lg"
                        >
                          <Eye className="w-4 h-4" />
                          Tampilkan
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Monitor className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-lg mb-2">Belum ada tampilan</p>
                        <p className="text-sm text-gray-500">Tambahkan tampilan untuk setiap lantai</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Updates Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Agenda Terkini</h2>
                <p className="text-gray-400">Aktivitas dan agenda ruangan terbaru</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30">
              {updates.length} Update
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 backdrop-blur-sm">
                  <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Lantai
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <DoorClosed className="w-4 h-4" />
                      Ruangan
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Agenda
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium last:rounded-tr-xl last:rounded-br-xl">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Jadwal
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {updates.length > 0 ? (
                  updates.map((room, idx) => (
                    <tr key={idx} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200">
                      <td className="p-4 text-gray-200 font-medium">{room.gedung}</td>
                      <td className="p-4 text-gray-200">{room.lantai}</td>
                      <td className="p-4 text-gray-200">{room.nama}</td>
                      <td className="p-4 text-gray-200">
                        <div className="max-w-xs truncate" title={room.kegiatan}>
                          {room.kegiatan}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">{room.jadwal}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Activity className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-lg mb-2">Tidak ada agenda terkini</p>
                        <p className="text-sm text-gray-500">Agenda dan aktivitas terbaru akan muncul di sini</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}