import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Building,
  Layers,
  Grid,
  ClipboardList,
  User,
  Calendar,
  Clock,
  Repeat,
  ChevronDown,
  Edit,
  Trash2,
  Save,
  X,
  CalendarDays,
  Users,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Activity,
  CheckSquare,
  Square
} from "lucide-react";

// Utility functions untuk format tanggal Indonesia
const formatDateToIndonesian = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const formatDateWithMonthName = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

const formatTimeToIndonesian = (timeString) => {
  if (!timeString) return '';
  
  if (timeString.match(/^\d{2}:\d{2}$/)) return timeString;
  
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) return timeString.substring(0, 5);
  
  return timeString;
};

// Utility function untuk mengformat keterangan recurrence
const formatRecurrenceInfo = (agenda) => {
  if (!agenda.recurrence_type || agenda.recurrence_type === 'none') {
    return { 
      text: 'Tidak Berulang', 
      color: 'bg-gray-500/20 text-gray-300 border-gray-400/30' 
    };
  }

  let text = '';
  let color = 'bg-blue-500/20 text-blue-300 border-blue-400/30';

  switch (agenda.recurrence_type) {
    case 'daily':
      const interval = agenda.recurrence_interval || 1;
      text = interval === 1 ? 'Harian' : `Setiap ${interval} Hari`;
      color = 'bg-green-500/20 text-green-300 border-green-400/30';
      break;
    
    case 'weekly':
      const weekInterval = agenda.recurrence_interval || 1;
      const days = agenda.recurrence_days ? agenda.recurrence_days.split(',') : [];
      let weekText = weekInterval === 1 ? 'Mingguan' : `Setiap ${weekInterval} Minggu`;
      if (days.length > 0) {
        weekText += ` (${days.join(', ')})`;
      }
      text = weekText;
      color = 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      break;
    
    case 'monthly':
      const monthInterval = agenda.recurrence_interval || 1;
      let monthText = monthInterval === 1 ? 'Bulanan' : `Setiap ${monthInterval} Bulan`;
      
      if (agenda.recurrence_monthly_mode === 'date' && agenda.recurrence_monthly_day) {
        monthText += ` (Tgl ${agenda.recurrence_monthly_day})`;
      } else if (agenda.recurrence_monthly_mode === 'day' && agenda.recurrence_monthly_weekday) {
        const weekNames = ['', 'ke-1', 'ke-2', 'ke-3', 'ke-4', '', 'terakhir'];
        const weekName = agenda.recurrence_monthly_week == -1 ? 'terakhir' : weekNames[agenda.recurrence_monthly_week] || '';
        monthText += ` (${agenda.recurrence_monthly_weekday} ${weekName})`;
      }
      text = monthText;
      color = 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      break;
    
    default:
      text = 'Berulang';
  }

  return { text, color };
};

const getDefaultEndDate = (startDate, recurrenceType, interval = 1, count = 6) => {
  if (!startDate) return "";
  const date = new Date(startDate);

  switch (recurrenceType) {
    case "daily":
      date.setDate(date.getDate() + count - 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7 * (count - 1));
      break;
    case "monthly":
      date.setMonth(date.getMonth() + (count - 1));
      break;
    default:
      return "";
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Agenda() {
  const [agendas, setAgendas] = useState([]);
  const [ruangans, setRuangans] = useState([]);
  const [form, setForm] = useState({
    id_ruangan: "",
    nama_kegiatan: "",
    deskripsi_kegiatan: "",
    pengguna: "",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
    recurrence_type: "none",
    recurrence_interval: 1,
    recurrence_days: [],
    recurrence_end_date: "",
    recurrence_count: "",
    recurrence_monthly_mode: "date",
    recurrence_monthly_day: "",           
    recurrence_monthly_week: "",          
    recurrence_monthly_weekday: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGedung, setFilterGedung] = useState("");
  
  // State untuk bulk selection
  const [selectedAgendas, setSelectedAgendas] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const token = localStorage.getItem("token");

  const fetchAgendas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/agenda", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgendas(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data agenda");
    }
  };

  const fetchRuangans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ruangan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRuangans(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto set default tanggal berakhir saat membuat agenda berulang
  useEffect(() => {
    if (
      form.recurrence_type !== "none" &&
      form.tanggal &&
      !form.recurrence_end_date &&
      !form.recurrence_count
    ) {
      setForm(prev => ({
        ...prev,
        recurrence_end_date: getDefaultEndDate(
          prev.tanggal,
          prev.recurrence_type,
          prev.recurrence_interval
        )
      }));
    }
  }, [form.tanggal, form.recurrence_type, form.recurrence_interval]);

  useEffect(() => {
    fetchAgendas();
    fetchRuangans();
  }, []);

  // Filter agendas
  const filteredAgendas = agendas.filter((agenda) => {
    const matchesSearch = 
      agenda.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.deskripsi_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.pengguna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.nama_ruangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.nama_gedung?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGedung = filterGedung === "" || agenda.nama_gedung === filterGedung;

    return matchesSearch && matchesGedung;
  });

  // Get unique values for filters
  const uniqueGedungs = [...new Set(agendas.map(a => a.nama_gedung).filter(Boolean))];

  // Bulk selection handlers
  const handleSelectAgenda = (id) => {
    setSelectedAgendas(prev => {
      if (prev.includes(id)) {
        return prev.filter(agendaId => agendaId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    const currentFilteredIds = filteredAgendas.map(a => a.id_jadwal);
    const allCurrentSelected = currentFilteredIds.every(id => selectedAgendas.includes(id));
    
    if (allCurrentSelected && currentFilteredIds.length > 0) {
      // Deselect all filtered agendas
      setSelectedAgendas(prev => prev.filter(id => !currentFilteredIds.includes(id)));
      setSelectAll(false);
    } else {
      // Select all filtered agendas
      const newSelected = [...new Set([...selectedAgendas, ...currentFilteredIds])];
      setSelectedAgendas(newSelected);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAgendas.length === 0) {
      setError("Pilih minimal satu agenda untuk dihapus");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus ${selectedAgendas.length} agenda yang dipilih?`)) return;

    try {
      const deletePromises = selectedAgendas.map(id =>
        axios.delete(`http://localhost:5000/api/agenda/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(deletePromises);
      
      setSuccess(`${selectedAgendas.length} agenda berhasil dihapus!`);
      setTimeout(() => setSuccess(""), 3000);
      setSelectedAgendas([]);
      setSelectAll(false);
      fetchAgendas();
    } catch (err) {
      setError("Gagal menghapus beberapa agenda");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedAgendas([]);
    setSelectAll(false);
  }, [searchTerm, filterGedung]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        ...form,
        recurrence_days: form.recurrence_days.join(","),
      };

      if (form.recurrence_end_date) {
        payload.recurrence_count = "";
      } else if (form.recurrence_count) {
        payload.recurrence_end_date = "";
      }

      if (editId) {
        await axios.put(`http://localhost:5000/api/agenda/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Agenda berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/agenda", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Agenda berhasil ditambahkan!");
      }
      setForm({
        id_ruangan: "",
        nama_kegiatan: "",
        deskripsi_kegiatan: "",
        pengguna: "",
        tanggal: "",
        waktu_mulai: "",
        waktu_selesai: "",
        recurrence_type: "none",
        recurrence_interval: 1,
        recurrence_days: [],
        recurrence_end_date: "",
        recurrence_count: "",
        recurrence_monthly_mode: "date",
        recurrence_monthly_day: "",           
        recurrence_monthly_week: "",          
        recurrence_monthly_weekday: "",
      });
      setEditId(null);
      setError("");
      setShowForm(false);
      setTimeout(() => setSuccess(""), 3000);
      fetchAgendas();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan agenda");
      setSuccess("");
    }
  };

  const handleEdit = (a) => {
    setForm({
      id_ruangan: ruangans.find((r) => r.nama_ruangan === a.nama_ruangan)?.id_ruangan || "",
      nama_kegiatan: a.nama_kegiatan,
      deskripsi_kegiatan: a.deskripsi_kegiatan,
      pengguna: a.pengguna,
      tanggal: a.tanggal,
      waktu_mulai: a.waktu_mulai,
      waktu_selesai: a.waktu_selesai,
      recurrence_type: a.recurrence_type || "none",
      recurrence_interval: a.recurrence_interval || 1,
      recurrence_days: a.recurrence_days ? a.recurrence_days.split(",") : [],
      recurrence_end_date: a.recurrence_end_date || "",
      recurrence_count: a.recurrence_count || "",
      recurrence_monthly_mode: a.recurrence_monthly_mode || "date",
      recurrence_monthly_day: a.recurrence_monthly_day || "",
      recurrence_monthly_week: a.recurrence_monthly_week || "",
      recurrence_monthly_weekday: a.recurrence_monthly_weekday || "",
    });
    setEditId(a.id_jadwal);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus agenda ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/agenda/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Agenda berhasil dihapus!");
      setTimeout(() => setSuccess(""), 3000);
      fetchAgendas();
    } catch (err) {
      setError("Gagal menghapus agenda");
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const days = prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter((d) => d !== day)
        : [...prev.recurrence_days, day];
      return { ...prev, recurrence_days: days };
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowForm(false);
    setForm({
      id_ruangan: "",
      nama_kegiatan: "",
      deskripsi_kegiatan: "",
      pengguna: "",
      tanggal: "",
      waktu_mulai: "",
      waktu_selesai: "",
      recurrence_type: "none",
      recurrence_interval: 1,
      recurrence_days: [],
      recurrence_end_date: "",
      recurrence_count: "",
      recurrence_monthly_mode: "date",
      recurrence_monthly_day: "",           
      recurrence_monthly_week: "",          
      recurrence_monthly_weekday: "",
    });
    setError("");
  };

  // Character limit helper
  const getCharCountColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 75) return "text-yellow-400";
    return "text-gray-400";
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
      </div>

      <div className="relative z-10 w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-white bg-clip-text text-transparent mb-2">
            Kelola Agenda
          </h1>
          <p className="text-xl text-gray-300">
            Atur jadwal dan agenda kegiatan ruangan kampus
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              {success}
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">
                  {editId ? "Edit Agenda" : "Agenda Baru"}
                </h2>
                <p className="text-gray-400">
                  {editId ? "Perbarui informasi agenda" : "Buat agenda kegiatan baru"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm && editId) {
                  cancelEdit();
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Tutup Form' : 'Tambah Agenda'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ruangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pilih Ruangan *
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_ruangan}
                      onChange={(e) => setForm({ ...form, id_ruangan: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="">Pilih Ruangan</option>
                      {ruangans.map((r) => (
                        <option key={r.id_ruangan} value={r.id_ruangan}>
                          {r.nama_gedung} - Lt {r.nomor_lantai} - {r.nama_ruangan}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Nama Kegiatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Nama Kegiatan *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama kegiatan"
                    value={form.nama_kegiatan}
                    onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value.slice(0, 25) })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    maxLength={25}
                    required
                  />
                  <p className={`text-xs mt-2 ${getCharCountColor(form.nama_kegiatan.length, 25)}`}>
                    {form.nama_kegiatan.length}/25 karakter
                  </p>
                </div>

                {/* Pengguna */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Pengguna *
                  </label>
                  <input
                    type="text"
                    placeholder="Nama pengguna atau organisasi"
                    value={form.pengguna}
                    onChange={(e) => setForm({ ...form, pengguna: e.target.value.slice(0, 25) })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    maxLength={25}
                    required
                  />
                  <p className={`text-xs mt-2 ${getCharCountColor(form.pengguna.length, 25)}`}>
                    {form.pengguna.length}/25 karakter
                  </p>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        tanggal: newDate,
                        recurrence_end_date:
                          prev.recurrence_type !== "none" && !prev.recurrence_count
                            ? getDefaultEndDate(newDate, prev.recurrence_type, prev.recurrence_interval)
                            : prev.recurrence_end_date
                      }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Waktu Mulai */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Waktu Mulai *
                  </label>
                  <input
                    type="time"
                    value={form.waktu_mulai}
                    onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Waktu Selesai */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Waktu Selesai *
                  </label>
                  <input
                    type="time"
                    value={form.waktu_selesai}
                    onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Deskripsi Kegiatan *
                </label>
                <textarea
                  placeholder="Deskripsikan kegiatan yang akan dilakukan..."
                  value={form.deskripsi_kegiatan}
                  onChange={(e) => setForm({ ...form, deskripsi_kegiatan: e.target.value.slice(0, 200) })}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  maxLength={200}
                  required
                />
                <p className={`text-xs mt-2 ${getCharCountColor(form.deskripsi_kegiatan.length, 200)}`}>
                  {form.deskripsi_kegiatan.length}/200 karakter
                </p>
              </div>

              {/* Perulangan */}
              <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Pengaturan Perulangan
                </label>
                <div className="relative mb-4">
                  <select
                    value={form.recurrence_type}
                    onChange={(e) => setForm({ ...form, recurrence_type: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="none">Tidak Berulang</option>
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {form.recurrence_type !== "none" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Interval */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Ulangi Setiap
                        </label>
                        <div className="relative">
                          {form.recurrence_type === "daily" && (
                            <select
                              value={form.recurrence_interval}
                              onChange={(e) => setForm({ ...form, recurrence_interval: e.target.value })}
                              className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            >
                              {[...Array(99)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} hari
                                </option>
                              ))}
                            </select>
                          )}

                          {form.recurrence_type === "weekly" && (
                            <select
                              value={form.recurrence_interval}
                              onChange={(e) => setForm({ ...form, recurrence_interval: e.target.value })}
                              className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            >
                              {[...Array(50)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} minggu
                                </option>
                              ))}
                            </select>
                          )}

                          {form.recurrence_type === "monthly" && (
                            <select
                              value={form.recurrence_interval}
                              onChange={(e) => setForm({ ...form, recurrence_interval: e.target.value })}
                              className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} bulan
                                </option>
                              ))}
                            </select>
                          )}
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tanggal Berakhir
                        </label>
                        <input
                          type="date"
                          value={form.recurrence_end_date}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              recurrence_end_date: e.target.value,
                              recurrence_count: e.target.value ? "" : form.recurrence_count,
                            })
                          }
                          disabled={form.recurrence_count}
                          className={`w-full p-3 border rounded-xl text-white transition-all duration-200 ${
                            form.recurrence_count
                              ? "bg-gray-600/30 border-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-gray-700/50 border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          }`}
                        />
                      </div>

                      {/* Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Jumlah Agenda
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Contoh: 5"
                          value={form.recurrence_count}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              recurrence_count: e.target.value,
                              recurrence_end_date: e.target.value ? "" : form.recurrence_end_date,
                            })
                          }
                          disabled={form.recurrence_end_date}
                          className={`w-full p-3 border rounded-xl text-white transition-all duration-200 placeholder-gray-400 ${
                            form.recurrence_end_date
                              ? "bg-gray-600/30 border-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-gray-700/50 border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Days (Weekly) */}
                    {form.recurrence_type === "weekly" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Pilih Hari
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                            <label
                              key={day}
                              className={`px-4 py-2 rounded-lg cursor-pointer border transition-all duration-200 ${
                                form.recurrence_days.includes(day)
                                  ? "bg-blue-600/40 border-blue-500 text-white shadow-lg"
                                  : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/70"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={form.recurrence_days.includes(day)}
                                onChange={() => toggleDay(day)}
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bulanan */}
                    {form.recurrence_type === "monthly" && (
                      <div className="border border-gray-600/30 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Terjadi Pada
                        </label>
                        <div className="relative mb-3">
                          <select
                            value={form.recurrence_monthly_mode}
                            onChange={(e) => setForm({ ...form, recurrence_monthly_mode: e.target.value })}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          >
                            <option value="date">By Date (Tanggal)</option>
                            <option value="day">By Day (Minggu + Hari)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {form.recurrence_monthly_mode === "date" && (
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={form.recurrence_monthly_day}
                            onChange={(e) => setForm({ ...form, recurrence_monthly_day: e.target.value })}
                            placeholder="Tanggal (1-31)"
                            className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                        )}

                        {form.recurrence_monthly_mode === "day" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                              <select
                                value={form.recurrence_monthly_week}
                                onChange={(e) => setForm({ ...form, recurrence_monthly_week: e.target.value })}
                                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              >
                                <option value="">-- Pilih Minggu ke --</option>
                                <option value="1">Minggu ke-1</option>
                                <option value="2">Minggu ke-2</option>
                                <option value="3">Minggu ke-3</option>
                                <option value="4">Minggu ke-4</option>
                                <option value="-1">Minggu Terakhir</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                              <select
                                value={form.recurrence_monthly_weekday}
                                onChange={(e) => setForm({ ...form, recurrence_monthly_weekday: e.target.value })}
                                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              >
                                <option value="">-- Pilih Hari --</option>
                                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-400/30 rounded-xl flex items-center gap-2 hover:bg-red-600/30 transition-all duration-200 hover:shadow-lg"
                  >
                    <X className="w-5 h-5" />
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {editId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editId ? "Simpan Perubahan" : "Tambah Agenda"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Filter Section */}
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
                  value={filterGedung}
                  onChange={(e) => setFilterGedung(e.target.value)}
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
                onClick={fetchAgendas}
                className="px-4 py-3 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-600/30 transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {(searchTerm || filterGedung) && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                Menampilkan {filteredAgendas.length} dari {agendas.length} agenda
                {searchTerm && ` yang mengandung "${searchTerm}"`}
                {filterGedung && ` di gedung ${filterGedung}`}
              </p>
            </div>
          )}
        </div>

        {/* Bulk Action Bar - Shows when items are selected */}
        {selectedAgendas.length > 0 && (
          <div className="bg-blue-600/20 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-4 mb-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <span className="text-blue-200 font-medium">
                  {selectedAgendas.length} agenda dipilih
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedAgendas([]);
                    setSelectAll(false);
                  }}
                  className="px-4 py-2 bg-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600/70 transition-all duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600/30 text-red-300 border border-red-400/30 rounded-xl hover:bg-red-600/40 transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus {selectedAgendas.length} Agenda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Daftar Agenda</h2>
                <p className="text-gray-400">Semua agenda kegiatan ruangan</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30 flex items-center gap-2 font-medium">
              <Activity className="w-4 h-4" />
              Total: {filteredAgendas.length} Agenda
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 backdrop-blur-sm">
                  <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                    >
                      {(() => {
                        const currentFilteredIds = filteredAgendas.map(a => a.id_jadwal);
                        const allCurrentSelected = currentFilteredIds.length > 0 && 
                          currentFilteredIds.every(id => selectedAgendas.includes(id));
                        return allCurrentSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        );
                      })()}
                    </button>
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <Building className="w-4 h-4 inline mr-2" /> Gedung
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <Layers className="w-4 h-4 inline mr-2" /> Lantai
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <Grid className="w-4 h-4 inline mr-2" /> Ruangan
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <ClipboardList className="w-4 h-4 inline mr-2" /> Kegiatan
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">Deskripsi</th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <User className="w-4 h-4 inline mr-2" /> Pengguna
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <Calendar className="w-4 h-4 inline mr-2" /> Tanggal
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <Clock className="w-4 h-4 inline mr-2" /> Waktu
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">
                    <Repeat className="w-4 h-4 inline mr-2" /> Jenis
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium last:rounded-tr-xl last:rounded-br-xl">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAgendas.length > 0 ? (
                  filteredAgendas.map((a) => {
                    const recurrenceInfo = formatRecurrenceInfo(a);
                    const isSelected = selectedAgendas.includes(a.id_jadwal);
                    return (
                      <tr
                        key={a.id_jadwal}
                        className={`border-b border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200 ${
                          isSelected ? 'bg-blue-600/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <button
                            onClick={() => handleSelectAgenda(a.id_jadwal)}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-gray-200 font-medium">{a.nama_gedung}</td>
                        <td className="p-4 text-gray-200">{a.nomor_lantai}</td>
                        <td className="p-4 text-gray-200">{a.nama_ruangan}</td>
                        <td className="p-4 text-gray-200 font-medium">{a.nama_kegiatan}</td>
                        <td className="p-4 text-gray-400">
                          <div className="max-w-xs truncate" title={a.deskripsi_kegiatan}>
                            {a.deskripsi_kegiatan}
                          </div>
                        </td>
                        <td className="p-4 text-gray-200">{a.pengguna}</td>
                        <td className="p-4 text-gray-200">
                          {formatDateWithMonthName(a.tanggal)}
                        </td>
                        <td className="p-4 text-gray-200">
                          <div className="text-sm">
                            {formatTimeToIndonesian(a.waktu_mulai)} - {formatTimeToIndonesian(a.waktu_selesai)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${recurrenceInfo.color}`}>
                            {recurrenceInfo.text}
                          </span>
                        </td>
                        <td className="p-4 text-gray-200 space-x-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(a)}
                              className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-200 hover:shadow-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(a.id_jadwal)}
                              className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-200 hover:shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="p-12 text-center text-gray-400">
                      {searchTerm || filterGedung ? (
                        <>
                          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Tidak ada agenda ditemukan</p>
                          <p className="text-sm mb-4">
                            Coba ubah kata kunci pencarian atau filter yang digunakan
                          </p>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setFilterGedung("");
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Reset Filter
                          </button>
                        </>
                      ) : (
                        <>
                          <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-lg mb-2">Tidak ada agenda</p>
                          <p className="text-sm text-gray-500">
                            Mulai dengan menambahkan agenda pertama Anda
                          </p>
                        </>
                      )}
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