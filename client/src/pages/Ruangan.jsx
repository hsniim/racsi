import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Building, 
  Layers, 
  Edit, 
  Trash2, 
  X, 
  Building2, 
  DoorOpen, 
  Users, 
  ChevronDown, 
  MapPin, 
  Save, 
  Search, 
  Filter, 
  RefreshCw,
  CheckSquare,
  Square
} from "lucide-react";

export default function Ruangan() {
  const [ruangans, setRuangans] = useState([]);
  const [filteredRuangans, setFilteredRuangans] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [form, setForm] = useState({
    id_lantai: "",
    nama_ruangan: "",
    kapasitas: "",
    status: "tidak_digunakan",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk filter dan pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGedung, setFilterGedung] = useState("");

  // State untuk bulk selection
  const [selectedRuangans, setSelectedRuangans] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const token = localStorage.getItem("token");

  const fetchRuangans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ruangan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRuangans(res.data.data || []);
      setFilteredRuangans(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data ruangan");
    }
  };

  const fetchLantais = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lantai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLantais(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchLantais();
    fetchRuangans();
  }, []);

  // Fungsi filter dan pencarian
  useEffect(() => {
    let result = [...ruangans];

    // Filter berdasarkan pencarian
    if (searchQuery) {
      result = result.filter((r) => 
        r.nama_ruangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nama_gedung.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nomor_lantai.toString().includes(searchQuery)
      );
    }

    // Filter berdasarkan gedung
    if (filterGedung) {
      result = result.filter((r) => r.nama_gedung === filterGedung);
    }

    setFilteredRuangans(result);
  }, [searchQuery, filterGedung, ruangans]);

  // Mendapatkan daftar gedung unik
  const uniqueGedung = [...new Set(ruangans.map((r) => r.nama_gedung))];

  // Character limit helper
  const getCharCountColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 75) return "text-yellow-400";
    return "text-gray-400";
  };

  // Bulk selection handlers
  const handleSelectRuangan = (id) => {
    setSelectedRuangans(prev => {
      if (prev.includes(id)) {
        return prev.filter(ruanganId => ruanganId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    const currentFilteredIds = filteredRuangans.map(r => r.id_ruangan);
    const allCurrentSelected = currentFilteredIds.every(id => selectedRuangans.includes(id));
    
    if (allCurrentSelected && currentFilteredIds.length > 0) {
      // Deselect all filtered ruangans
      setSelectedRuangans(prev => prev.filter(id => !currentFilteredIds.includes(id)));
      setSelectAll(false);
    } else {
      // Select all filtered ruangans
      const newSelected = [...new Set([...selectedRuangans, ...currentFilteredIds])];
      setSelectedRuangans(newSelected);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRuangans.length === 0) {
      setError("Pilih minimal satu ruangan untuk dihapus");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus ${selectedRuangans.length} ruangan yang dipilih?`)) return;

    try {
      const deletePromises = selectedRuangans.map(id =>
        axios.delete(`http://localhost:5000/api/ruangan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(deletePromises);
      
      setSuccess(`${selectedRuangans.length} ruangan berhasil dihapus!`);
      setTimeout(() => setSuccess(""), 3000);
      setSelectedRuangans([]);
      setSelectAll(false);
      fetchRuangans();
    } catch (err) {
      setError("Gagal menghapus beberapa ruangan");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedRuangans([]);
    setSelectAll(false);
  }, [searchQuery, filterGedung]);

  const handleRefresh = () => {
    setSearchQuery("");
    setFilterGedung("");
    fetchRuangans();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/ruangan/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Ruangan berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/ruangan", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Ruangan berhasil ditambahkan!");
      }
      setForm({ id_lantai: "", nama_ruangan: "", kapasitas: "", status: "tidak_digunakan" });
      setEditId(null);
      setError("");
      setShowForm(false);
      setTimeout(() => setSuccess(""), 3000);
      fetchRuangans();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan ruangan");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id_ruangan);
    setForm({
      id_lantai: r.id_lantai,
      nama_ruangan: r.nama_ruangan,
      kapasitas: r.kapasitas,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus ruangan ini?")) return;
    setLoading(true);

    try {
      await axios.delete(`http://localhost:5000/api/ruangan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Ruangan berhasil dihapus!");
      fetchRuangans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus ruangan");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ id_lantai: "", nama_ruangan: "", kapasitas: "", status: "tidak_digunakan" });
    setError("");
    setShowForm(false);
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
              Kelola Ruangan
            </h1>
          </div>
          <p className="text-xl text-gray-300 ml-13">
            Tambah, edit, dan kelola ruangan beserta kapasitasnya
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
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
                  {editId ? "Edit Ruangan" : "Ruangan Baru"}
                </h2>
                <p className="text-gray-400">
                  {editId ? "Perbarui data ruangan dan kapasitas" : "Tambahkan ruangan baru dengan detail lengkap"}
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
              {showForm ? 'Tutup Form' : 'Tambah Ruangan'}
            </button>
          </div>

          {/* Form - Collapsible */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lantai */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pilih Lantai <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_lantai}
                      onChange={(e) => setForm({ ...form, id_lantai: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="">-- Pilih Lantai --</option>
                      {lantais.map((l) => (
                        <option key={l.id_lantai} value={l.id_lantai}>
                          {l.nama_gedung} - Lantai {l.nomor_lantai}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Nama Ruangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <DoorOpen className="w-4 h-4" />
                    Nama Ruangan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama ruangan"
                    value={form.nama_ruangan}
                    onChange={(e) => setForm({ ...form, nama_ruangan: e.target.value.slice(0, 10) })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    maxLength={10}
                    required
                  />
                  <p className={`text-xs mt-2 ${getCharCountColor(form.nama_ruangan.length, 10)}`}>
                    {form.nama_ruangan.length}/10 karakter
                  </p>
                </div>

                {/* Kapasitas */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Kapasitas <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Kapasitas ruangan"
                    value={form.kapasitas}
                    onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-400/30 rounded-xl flex items-center gap-2 hover:bg-red-600/30 transition-all duration-200 hover:shadow-lg"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" /> Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-1"></div>
                  ) : editId ? (
                    <Save className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {loading ? "Memproses..." : (editId ? "Simpan Perubahan" : "Tambah Ruangan")}
                </button>
              </div>
            </form>
          )}
        </div>

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
                  placeholder="Cari ruangan, gedung, atau lantai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  {uniqueGedung.map((gedung) => (
                    <option key={gedung} value={gedung}>
                      {gedung}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-3 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-600/30 transition-all duration-200 flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {(searchQuery || filterGedung) && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                Menampilkan {filteredRuangans.length} dari {ruangans.length} ruangan
                {searchQuery && ` yang mengandung "${searchQuery}"`}
                {filterGedung && ` di gedung ${filterGedung}`}
              </p>
            </div>
          )}
        </div>

        {/* Bulk Action Bar - Shows when items are selected */}
        {selectedRuangans.length > 0 && (
          <div className="bg-blue-600/20 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-4 mb-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <span className="text-blue-200 font-medium">
                  {selectedRuangans.length} ruangan dipilih
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedRuangans([]);
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
                  Hapus {selectedRuangans.length} Ruangan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <DoorOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Daftar Ruangan</h2>
                <p className="text-gray-400">Kelola semua ruangan dan informasinya</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30 font-medium flex items-center gap-2">
                <DoorOpen className="w-4 h-4" />
                Total: {filteredRuangans.length} Ruangan
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/30">
                  <th className="p-4 text-left text-sm font-medium text-gray-300 first:rounded-tl-xl">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                    >
                      {(() => {
                        const currentFilteredIds = filteredRuangans.map(r => r.id_ruangan);
                        const allCurrentSelected = currentFilteredIds.length > 0 && 
                          currentFilteredIds.every(id => selectedRuangans.includes(id));
                        return allCurrentSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        );
                      })()}
                    </button>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
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
                      <DoorOpen className="w-4 h-4" />
                      Ruangan
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Kapasitas
                    </div>
                  </th>
                  <th className="p-4 text-center text-sm font-medium text-gray-300 last:rounded-tr-xl">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mb-4"></div>
                        <p>Memuat data ruangan...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRuangans.length > 0 ? (
                  filteredRuangans.map((r) => {
                    const isSelected = selectedRuangans.includes(r.id_ruangan);
                    return (
                      <tr 
                        key={r.id_ruangan} 
                        className={`border-b border-gray-700/20 hover:bg-gray-700/20 transition-all duration-200 ${
                          isSelected ? 'bg-blue-600/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <button
                            onClick={() => handleSelectRuangan(r.id_ruangan)}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-gray-200 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-400" />
                            </div>
                            {r.nama_gedung}
                          </div>
                        </td>
                        <td className="p-4 text-gray-200">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 text-sm font-medium">
                            Lantai {r.nomor_lantai}
                          </span>
                        </td>
                        <td className="p-4 text-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                              <DoorOpen className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="font-medium">{r.nama_ruangan}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-200">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm font-medium">
                              {r.kapasitas} orang
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center last:rounded-tr-xl last:rounded-br-xl">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-200 group hover:shadow-lg"
                              disabled={loading}
                              title="Edit ruangan"
                            >
                              <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id_ruangan)}
                              className="p-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-200 group hover:shadow-lg"
                              disabled={loading}
                              title="Hapus ruangan"
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        {searchQuery || filterGedung ? (
                          <>
                            <Search className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Tidak ada ruangan ditemukan</p>
                            <p className="text-sm mb-4">
                              Coba ubah kata kunci pencarian atau filter yang digunakan
                            </p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setFilterGedung("");
                              }}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Reset Filter
                            </button>
                          </>
                        ) : (
                          <>
                            <DoorOpen className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Belum ada data ruangan</p>
                            <p className="text-sm">Tambahkan ruangan pertama dengan tombol di atas</p>
                          </>
                        )}
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