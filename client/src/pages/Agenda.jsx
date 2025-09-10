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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // logika baru: hanya kirim salah satu (end_date atau count)
      let payload = {
        ...form,
        recurrence_days: form.recurrence_days.join(","),
      };

      if (form.recurrence_end_date) {
        payload.recurrence_count = ""; // kosongkan jika end_date dipakai
      } else if (form.recurrence_count) {
        payload.recurrence_end_date = ""; // kosongkan jika count dipakai
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          Kelola Agenda
        </h1>
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

      {/* Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">
          {editId ? "Edit Agenda" : "Tambah Agenda Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ruangan */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Ruangan</label>
              <select
                value={form.id_ruangan}
                onChange={(e) => setForm({ ...form, id_ruangan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              >
                <option value="">Pilih Ruangan</option>
                {ruangans.map((r) => (
                  <option key={r.id_ruangan} value={r.id_ruangan}>
                    {r.nama_gedung} - Lt {r.nomor_lantai} - {r.nama_ruangan}
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Kegiatan */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nama Kegiatan</label>
              <input
                type="text"
                value={form.nama_kegiatan}
                onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi</label>
              <textarea
                value={form.deskripsi_kegiatan}
                onChange={(e) => setForm({ ...form, deskripsi_kegiatan: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                rows={3}
                required
              />
            </div>

            {/* Pengguna */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Pengguna</label>
              <input
                type="text"
                value={form.pengguna}
                onChange={(e) => setForm({ ...form, pengguna: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tanggal</label>
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
  className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
  required
/>

            </div>

            {/* Waktu Mulai */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Waktu Mulai</label>
              <input
                type="time"
                value={form.waktu_mulai}
                onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            {/* Waktu Selesai */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Waktu Selesai</label>
              <input
                type="time"
                value={form.waktu_selesai}
                onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                required
              />
            </div>

            {/* Perulangan */}
            <div className="md:col-span-2 border-t border-gray-600/30 pt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Repeat className="w-4 h-4" /> Pengaturan Perulangan
              </label>
              <select
                value={form.recurrence_type}
                onChange={(e) => setForm({ ...form, recurrence_type: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white mb-3"
              >
                <option value="none">Tidak Berulang</option>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>

              {form.recurrence_type !== "none" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Interval */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Ulangi Setiap
                    </label>

                    {form.recurrence_type === "daily" && (
                      <select
                        value={form.recurrence_interval}
                        onChange={(e) => setForm({ ...form, recurrence_interval: e.target.value })}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
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
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
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
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} bulan
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Tanggal Berakhir
                    </label>
                    <input
                      type="date"
                      value={form.recurrence_end_date}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          recurrence_end_date: e.target.value,
                          recurrence_count: e.target.value ? "" : form.recurrence_count, // kosongkan count kalau end_date diisi
                        })
                      }
                      disabled={form.recurrence_count} // disable kalau ada count
                      className={`w-full p-3 border rounded-xl text-white ${
                        form.recurrence_count
                          ? "bg-gray-600/30 border-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-700/50 border-gray-600/30"
                      }`}
                    />
                  </div>

                  {/* Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Jumlah Agenda
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.recurrence_count}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          recurrence_count: e.target.value,
                          recurrence_end_date: e.target.value ? "" : form.recurrence_end_date, // kosongkan end_date kalau count diisi
                        })
                      }
                      disabled={form.recurrence_end_date} // disable kalau ada end_date
                      className={`w-full p-3 border rounded-xl text-white ${
                        form.recurrence_end_date
                          ? "bg-gray-600/30 border-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-700/50 border-gray-600/30"
                      }`}
                    />
                  </div>

                  {/* Days (Weekly) */}
                  {form.recurrence_type === "weekly" && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Pilih Hari
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                          <label
                            key={day}
                            className={`px-3 py-1 rounded-lg cursor-pointer border ${
                              form.recurrence_days.includes(day)
                                ? "bg-blue-600/40 border-blue-500 text-white"
                                : "bg-gray-700/50 border-gray-600 text-gray-300"
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
                    <div className="col-span-2 border border-gray-600/30 p-4 rounded-lg mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Terjadi Pada
                      </label>
                      <select
                        value={form.recurrence_monthly_mode}
                        onChange={(e) => setForm({ ...form, recurrence_monthly_mode: e.target.value })}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white mb-3"
                      >
                        <option value="date">By Date (Tanggal)</option>
                        <option value="day">By Day (Minggu + Hari)</option>
                      </select>

                      {form.recurrence_monthly_mode === "date" && (
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={form.recurrence_monthly_day}
                          onChange={(e) => setForm({ ...form, recurrence_monthly_day: e.target.value })}
                          placeholder="Tanggal (1-31)"
                          className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                        />
                      )}

                      {form.recurrence_monthly_mode === "day" && (
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={form.recurrence_monthly_week}
                            onChange={(e) => setForm({ ...form, recurrence_monthly_week: e.target.value })}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                          >
                            <option value="">-- Pilih Minggu ke --</option>
                            <option value="1">Minggu ke-1</option>
                            <option value="2">Minggu ke-2</option>
                            <option value="3">Minggu ke-3</option>
                            <option value="4">Minggu ke-4</option>
                            <option value="-1">Minggu Terakhir</option>
                          </select>
                          <select
                            value={form.recurrence_monthly_weekday}
                            onChange={(e) => setForm({ ...form, recurrence_monthly_weekday: e.target.value })}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
                          >
                            <option value="">-- Pilih Hari --</option>
                            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border border-gray-600/30 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> {editId ? "Simpan Perubahan" : "Tambah Agenda"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-300">Daftar Agenda</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {agendas.length} Agenda
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 backdrop-blur-sm">
                <th className="p-4 text-left text-gray-300 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                  <Building className="w-4 h-4 inline" /> Gedung
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <Layers className="w-4 h-4 inline" /> Lantai
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <Grid className="w-4 h-4 inline" /> Ruangan
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <ClipboardList className="w-4 h-4 inline" /> Kegiatan
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">Deskripsi</th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <User className="w-4 h-4 inline" /> Pengguna
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <Calendar className="w-4 h-4 inline" /> Tanggal
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">
                  <Clock className="w-4 h-4 inline" /> Waktu
                </th>
                <th className="p-4 text-left text-gray-300 font-medium last:rounded-tr-xl last:rounded-br-xl">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {agendas.length > 0 ? (
                agendas.map((a) => (
                  <tr
                    key={a.id_jadwal}
                    className="border-b border-gray-700/30 hover:bg-gray-700/30"
                  >
                    <td className="p-4 text-gray-200 first:rounded-tl-xl first:rounded-bl-xl">
                      {a.nama_gedung}
                    </td>
                    <td className="p-4 text-gray-200">{a.nomor_lantai}</td>
                    <td className="p-4 text-gray-200">{a.nama_ruangan}</td>
                    <td className="p-4 text-gray-200 font-medium">{a.nama_kegiatan}</td>
                    <td className="p-4 text-gray-400">{a.deskripsi_kegiatan}</td>
                    <td className="p-4 text-gray-200">{a.pengguna}</td>
                    <td className="p-4 text-gray-200">
                      {formatDateWithMonthName(a.tanggal)}
                    </td>
                    <td className="p-4 text-gray-200">
                      {formatTimeToIndonesian(a.waktu_mulai)} - {formatTimeToIndonesian(a.waktu_selesai)}
                    </td>
                    <td className="p-4 text-gray-200 space-x-2 last:rounded-tr-xl last:rounded-br-xl">
                      <button
                        onClick={() => handleEdit(a)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id_jadwal)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-400">
                    <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-lg">Tidak ada data agenda</p>
                    <p className="text-sm text-gray-500">
                      Mulai dengan menambahkan agenda pertama Anda
                    </p>
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
