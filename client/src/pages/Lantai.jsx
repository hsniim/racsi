import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Layers, Edit, Trash2, X, Building2, User, Clock, ChevronDown, Users, MapPin, Save } from "lucide-react";

export default function Lantai() {
  const [lantais, setLantais] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    id_gedung: "",
    nomor_lantai: "",
    pj: {
      shift: "pagi",
      nama: "",
    },
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchLantais = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lantai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLantais(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data lantai");
    }
  };

  const fetchGedungs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGedungs(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchGedungs();
    fetchLantais();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/lantai/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Lantai + PJ berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/lantai", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Lantai + PJ berhasil ditambahkan!");
      }
      setForm({
        id_gedung: "",
        nomor_lantai: "",
        pj: { shift: "pagi", nama: "" },
      });
      setEditId(null);
      setError("");
      setShowForm(false);
      fetchLantais();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan lantai");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (l) => {
    setEditId(l.id_lantai);
    setForm({
      id_gedung: l.id_gedung,
      nomor_lantai: l.nomor_lantai,
      pj: {
        shift: l.pj?.shift || "pagi",
        nama: l.pj?.nama || "",
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus lantai ini?")) return;
    setLoading(true);
    
    try {
      await axios.delete(`http://localhost:5000/api/lantai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Lantai berhasil dihapus!");
      fetchLantais();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus lantai");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ id_gedung: "", nomor_lantai: "", pj: { shift: "pagi", nama: "" } });
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
              Kelola Lantai
            </h1>
          </div>
          <p className="text-xl text-gray-300 ml-13">
            Tambah, edit, dan kelola lantai beserta penanggung jawab setiap lantai
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
                  {editId ? "Edit Lantai" : "Lantai Baru"}
                </h2>
                <p className="text-gray-400">
                  {editId ? "Perbarui data lantai dan penanggung jawab" : "Tambahkan lantai baru dengan penanggung jawab"}
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
              {showForm ? 'Tutup Form' : 'Tambah Lantai'}
            </button>
          </div>

          {/* Form - Collapsible */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gedung */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Pilih Gedung <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_gedung}
                      onChange={(e) => setForm({ ...form, id_gedung: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="">-- Pilih Gedung --</option>
                      {gedungs.map((g) => (
                        <option key={g.id_gedung} value={g.id_gedung}>
                          {g.nama_gedung}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Nomor Lantai */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Nomor Lantai <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Masukkan nomor lantai"
                    value={form.nomor_lantai}
                    onChange={(e) => setForm({ ...form, nomor_lantai: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* PJ Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nama PJ Lantai <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama penanggung jawab"
                    value={form.pj.nama}
                    onChange={(e) => setForm({ ...form, pj: { ...form.pj, nama: e.target.value } })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* PJ Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Shift <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.pj.shift}
                      onChange={(e) => setForm({ ...form, pj: { ...form.pj, shift: e.target.value } })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="pagi">Pagi (07:00 - 15:00)</option>
                      <option value="siang">Siang (15:00 - 23:00)</option>
                      <option value="malam">Malam (23:00 - 07:00)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
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
                  {loading ? "Memproses..." : (editId ? "Simpan Perubahan" : "Tambah Lantai")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Daftar Lantai</h2>
                <p className="text-gray-400">Kelola semua lantai dan penanggung jawabnya</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30 font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total: {lantais.length} Lantai
              </span>
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
                      Nomor Lantai
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      PJ Lantai
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Shift
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
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mb-4"></div>
                        <p>Memuat data lantai...</p>
                      </div>
                    </td>
                  </tr>
                ) : lantais.length > 0 ? (
                  lantais.map((l) => (
                    <tr
                      key={l.id_lantai}
                      className="border-b border-gray-700/20 hover:bg-gray-700/20 transition-all duration-200"
                    >
                      <td className="p-4 text-gray-200 font-medium first:rounded-tl-xl first:rounded-bl-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                          {l.nama_gedung}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 text-sm font-medium">
                          Lantai {l.nomor_lantai}
                        </span>
                      </td>
                      <td className="p-4 text-gray-200">
                        {l.pjs && l.pjs.length > 0 ? (
                          l.pjs.map((pj) => (
                            <div key={pj.id_pj_lantai} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-green-400" />
                              </div>
                              {pj.nama}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-200">
                        {l.pjs && l.pjs.length > 0 ? (
                          l.pjs.map((pj) => (
                            <div key={pj.id_pj_lantai}>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pj.shift === 'pagi' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                                pj.shift === 'siang' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                                'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                              }`}>
                                {pj.shift.charAt(0).toUpperCase() + pj.shift.slice(1)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center last:rounded-tr-xl last:rounded-br-xl">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(l)}
                            className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-200 group hover:shadow-lg"
                            disabled={loading}
                            title="Edit lantai"
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDelete(l.id_lantai)}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-200 group hover:shadow-lg"
                            disabled={loading}
                            title="Hapus lantai"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <MapPin className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Belum ada data lantai</p>
                        <p className="text-sm">Tambahkan lantai pertama dengan tombol di atas</p>
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