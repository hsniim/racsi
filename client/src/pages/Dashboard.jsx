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
  X
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
    nama_device: "" // Tambahkan ini jika backend masih memerlukannya
  });
  const [editDeviceId, setEditDeviceId] = useState(null);
  const [deviceMsg, setDeviceMsg] = useState({ type: "", text: "" });

  // State untuk mengontrol tampilan section
  const [showDeviceSection, setShowDeviceSection] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  // Existing functions
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

  // Device management functions (dari TvDevice.jsx)
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
      
      // Debug log untuk melihat data yang diterima
      console.log("Gedungs:", g.data.data);
      console.log("Lantais:", l.data.data);
      
      // Jika tidak preserve filter dan tidak ada gedung yang dipilih, kosongkan filtered lantais
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
    console.log("Selected gedung ID:", selectedGedungId); // Debug log
    
    setDeviceForm({ 
      ...deviceForm, 
      id_gedung: selectedGedungId, 
      id_lantai: "",
      nama_device: selectedGedungId ? `Device-${selectedGedungId}` : "" // Auto generate nama device
    });
    
    if (selectedGedungId) {
      // Gunakan === untuk strict comparison dan pastikan type data konsisten
      const filtered = lantais.filter(l => String(l.id_gedung) === String(selectedGedungId));
      console.log("Filtered lantais:", filtered); // Debug log
      console.log("All lantais:", lantais); // Debug log
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
      // Update nama device dengan info gedung dan lantai
      nama_device: selectedLantaiId ? `Device-${deviceForm.id_gedung}-L${selectedLantai?.nomor_lantai || selectedLantaiId}` : deviceForm.nama_device
    });
  };

  const submitDevice = async (e) => {
    e.preventDefault();
    
    // Validasi manual
    if (!deviceForm.id_gedung || !deviceForm.id_lantai) {
      setDeviceMsg({ type: "error", text: "Harap pilih gedung dan lantai" });
      return;
    }
    
    try {
      // Prepare data for submission
      const submitData = {
        id_gedung: deviceForm.id_gedung,
        id_lantai: deviceForm.id_lantai,
        nama_device: deviceForm.nama_device || `Device-${deviceForm.id_gedung}-${deviceForm.id_lantai}`
      };
      
      console.log("Submitting data:", submitData); // Debug log
      
      if (editDeviceId) {
        await api.put(`/tv-device/${editDeviceId}`, submitData);
        setDeviceMsg({ type: "success", text: "Device berhasil diperbarui" });
      } else {
        await api.post("/tv-device", submitData);
        setDeviceMsg({ type: "success", text: "Device berhasil ditambahkan" });
      }
      
      // Reset form
      setDeviceForm({ id_gedung: "", id_lantai: "", nama_device: "" });
      setEditDeviceId(null);
      setFilteredLantais([]);
      // Tutup form setelah berhasil submit
      setShowDeviceSection(false);
      await loadDeviceData();
      
      // Clear message after 3 seconds
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
    // Fetch data pertama kali
    fetchData();
    fetchGedungLantaiList();
    loadDeviceData();

    // Refresh otomatis setiap 5 detik
    const interval = setInterval(() => {
      fetchData();
      fetchGedungLantaiList();
      loadDeviceData(true); // Preserve filter saat auto refresh
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Device Management Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            <Monitor className="w-6 h-6" />
            Daftar Tampilan
          </h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
              {devices.length} Tampilan
            </span>
            <button
              onClick={() => setShowDeviceSection(!showDeviceSection)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              {showDeviceSection ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showDeviceSection ? 'Tutup' : 'Tambah Tampilan'}
            </button>
          </div>
        </div>

        {/* Device Form - Collapsible */}
        {showDeviceSection && (
          <div className="mb-6">
            {deviceMsg.text && (
              <div className={`mb-4 p-3 rounded-xl border ${
                deviceMsg.type === "success" 
                  ? "bg-green-600/20 border-green-400/30 text-green-200" 
                  : "bg-red-600/20 border-red-400/30 text-red-200"
              }`}>
                {deviceMsg.text}
              </div>
            )}

            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <h3 className="text-lg text-gray-200 font-medium mb-4">
                {editDeviceId ? "Edit Tampilan" : "Tambah Tampilan"}
              </h3>
              <form onSubmit={submitDevice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pilih Gedung *
                    </label>
                    <select
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={deviceForm.id_gedung}
                      onChange={handleGedungChange}
                      required
                    >
                      <option value="">-- Pilih Gedung --</option>
                      {gedungs.map(g => 
                        <option key={g.id_gedung} value={g.id_gedung}>{g.nama_gedung}</option>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pilih Lantai *
                    </label>
                    <select
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      value={deviceForm.id_lantai}
                      onChange={handleLantaiChange}
                      required
                      disabled={!deviceForm.id_gedung}
                    >
                      <option value="">-- Pilih Lantai --</option>
                      {filteredLantais.map(l => (
                        <option key={l.id_lantai} value={l.id_lantai}>
                          Lantai {l.nomor_lantai}
                        </option>
                      ))}
                    </select>
                    {deviceForm.id_gedung && filteredLantais.length === 0 && (
                      <p className="text-sm text-yellow-400 mt-1">
                        Tidak ada lantai tersedia untuk gedung ini
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Hidden field untuk nama_device jika masih diperlukan backend */}
                <input 
                  type="hidden" 
                  name="nama_device" 
                  value={deviceForm.nama_device}
                />
                
                <div className="flex gap-2">
                  {editDeviceId ? (
                    <>
                      <button
                        type="button"
                        onClick={batalEdit}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <X size={18}/>
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Save size={18}/>
                        Simpan Perubahan
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Plus size={18}/>
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
                <th className="p-3 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">ID</th>
                <th className="p-3 text-left text-gray-300 font-medium text-center">Gedung</th>
                <th className="p-3 text-left text-gray-300 font-medium text-center">Lantai</th>
                <th className="p-3 text-center text-gray-300 font-medium  last:rounded-tr-xl last:rounded-br-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {devices.length ? devices.map(d => (
                <tr key={d.id_device} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200">
                  <td className="p-3 text-gray-200 first:rounded-tl-xl first:rounded-bl-xl">{d.id_device}</td>
                  <td className="p-3 text-gray-200 text-center">{d.nama_gedung}</td>
                  <td className="p-3 text-gray-200 text-center">Lantai {d.nomor_lantai}</td>
                  <td className="p-3 text-center last:rounded-tr-xl last:rounded-br-xl">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => editDevice(d)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Edit size={14}/>
                        Edit
                      </button>
                      <button
                        onClick={() => hapusDevice(d.id_device)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 size={14}/>
                        Hapus
                      </button>
                      <button
                        onClick={() => handleTampilkanDevice(d.id_gedung, d.id_lantai)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Monitor size={14}/>
                        Tampilkan
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Monitor className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-lg mb-2">Belum ada device TV</p>
                      <p className="text-sm text-gray-500">Tambahkan device TV untuk setiap lantai</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Updates Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Agenda Terkini</h2>
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
    </div>
  );
}