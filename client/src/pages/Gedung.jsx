import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  QrCode, 
  User, 
  Phone, 
  Link, 
  ChevronDown,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  Zap
} from "lucide-react";

export default function Gedung() {
  const [gedungs, setGedungs] = useState([]);
  const [form, setForm] = useState({
    nama_gedung: "",
    lokasi_gedung: "jakarta",
    qrcode_feedback: "",
    pj: {
      nama: "",
      no_telp: "",
      link_peminjaman: "",
      qrcodepath_pinjam: "",
      qrcodepath_kontak: "",
    },
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);

  const token = window.localStorage.getItem("token");

  // Function to check if input is a URL
  const isUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Check if QR code is base64 data URL
  const isBase64QR = (string) => {
    return string && string.startsWith('data:image/png;base64,');
  };

  // Handle QR Code Feedback input change
  const handleQrFeedbackChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, qrcode_feedback: value });
  };

  const fetchGedungs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/gedung", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Data gedung dari backend:", res.data);
      setGedungs(res.data.data || []);
      setError("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengambil data gedung");
      setGedungs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGedungs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalForm = { ...form };
      
      // Backend will handle QR generation automatically
      if (finalForm.qrcode_feedback && isUrl(finalForm.qrcode_feedback)) {
        console.log('URL detected for QR generation:', finalForm.qrcode_feedback);
        setQrGenerating(true);
      }

      if (editId) {
        await axios.put(`http://localhost:5000/api/gedung/${editId}`, finalForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Gedung + PJ berhasil diperbarui dengan QR Code!");
      } else {
        await axios.post("http://localhost:5000/api/gedung", finalForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Gedung + PJ berhasil ditambahkan dengan QR Code!");
      }

      setForm({
        nama_gedung: "",
        lokasi_gedung: "jakarta",
        qrcode_feedback: "",
        pj: {
          nama: "",
          no_telp: "",
          link_peminjaman: "",
          qrcodepath_pinjam: "",
          qrcodepath_kontak: "",
        },
      });
      setEditId(null);
      setError("");
      setShowForm(false);
      fetchGedungs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menyimpan gedung");
      setSuccess("");
    } finally {
      setLoading(false);
      setQrGenerating(false);
    }
  };

  const handleEdit = (g) => {
    setEditId(g.id_gedung);
    setForm({
      nama_gedung: g.nama_gedung || "",
      lokasi_gedung: g.lokasi_gedung || "jakarta",
      qrcode_feedback: g.qrcode_feedback || "",
      pj: {
        nama: g.pj?.nama || "",
        no_telp: g.pj?.no_telp || "",
        link_peminjaman: g.pj?.link_peminjaman || "",
        qrcodepath_pinjam: g.pj?.qrcodepath_pinjam || "",
        qrcodepath_kontak: g.pj?.qrcodepath_kontak || "",
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus gedung ini?")) return;
    setLoading(true);

    try {
      await axios.delete(`http://localhost:5000/api/gedung/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Gedung berhasil dihapus!");
      fetchGedungs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal menghapus gedung");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowForm(false);
    setForm({
      nama_gedung: "",
      lokasi_gedung: "jakarta",
      qrcode_feedback: "",
      pj: {
        nama: "",
        no_telp: "",
        link_peminjaman: "",
        qrcodepath_pinjam: "",
        qrcodepath_kontak: "",
      },
    });
    setError("");
  };

  return (
    <div className="w-full min-h-screen bg-primary text-white relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
        <div className="absolute top-96 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-80 right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12"></div>
      </div>

      <div className="relative z-10 w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r bg-white bg-clip-text text-transparent">
              Kelola Gedung
            </h1>
          </div>
          <p className="text-xl text-gray-300 ml-13">
            Atur informasi gedung dengan QR Code Generator
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
                  {editId ? "Edit Gedung" : "Gedung Baru"}
                </h2>
                <p className="text-gray-400">
                  {editId ? "Perbarui informasi gedung" : "Tambah gedung baru dengan QR Code"}
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
              {showForm ? 'Tutup Form' : 'Tambah Gedung'}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-200">Informasi Dasar Gedung</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Nama Gedung <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama gedung"
                      value={form.nama_gedung}
                      onChange={(e) => setForm({ ...form, nama_gedung: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lokasi <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.lokasi_gedung}
                        onChange={(e) => setForm({ ...form, lokasi_gedung: e.target.value })}
                        className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="jakarta">Jakarta</option>
                        <option value="depok">Depok</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      URL untuk QR Code Feedback <span className="text-red-400">*</span>
                      {qrGenerating && <div className="w-4 h-4 border border-blue-300/30 border-t-blue-300 rounded-full animate-spin ml-2"></div>}
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/feedback"
                      value={form.qrcode_feedback}
                      onChange={handleQrFeedbackChange}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                    />
                    {form.qrcode_feedback && (
                      <div className="mt-2 text-sm">
                        {isUrl(form.qrcode_feedback) ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            URL valid - QR Code akan di-generate otomatis
                          </span>
                        ) : (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Masukkan URL yang valid untuk generate QR Code
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data PJ Gedung */}
              <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-200">Data Penanggung Jawab Gedung</h3>
                    <p className="text-sm text-gray-400">Informasi kontak dan fasilitas peminjaman</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nama PJ Gedung
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama penanggung jawab"
                      value={form.pj.nama}
                      onChange={(e) => setForm({ ...form, pj: { ...form.pj, nama: e.target.value } })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      No Telepon
                    </label>
                    <input
                      type="text"
                      placeholder="08xxxxxxx"
                      value={form.pj.no_telp}
                      onChange={(e) => setForm({ ...form, pj: { ...form.pj, no_telp: e.target.value } })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Link Peminjaman
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.pj.link_peminjaman}
                      onChange={(e) => setForm({ ...form, pj: { ...form.pj, link_peminjaman: e.target.value } })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      QR Code Peminjaman
                    </label>
                    <input
                      type="text"
                      placeholder="Path QR Code Peminjaman"
                      value={form.pj.qrcodepath_pinjam}
                      onChange={(e) => setForm({ ...form, pj: { ...form.pj, qrcodepath_pinjam: e.target.value } })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      QR Code Kontak
                    </label>
                    <input
                      type="text"
                      placeholder="Path QR Code Kontak"
                      value={form.pj.qrcodepath_kontak}
                      onChange={(e) => setForm({ ...form, pj: { ...form.pj, qrcodepath_kontak: e.target.value } })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-400/30 rounded-xl flex items-center gap-2 hover:bg-red-600/30 transition-all duration-200 hover:shadow-lg"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" />
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                  disabled={loading || qrGenerating}
                >
                  {loading || qrGenerating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-1"></div>
                  ) : editId ? (
                    <Save className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {loading ? "Memproses..." : qrGenerating ? "Generate QR..." : (editId ? "Simpan Perubahan" : "Tambah Gedung")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Daftar Gedung</h2>
                <p className="text-gray-400">QR Code generated automatically</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Total: {gedungs.length} Gedung
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
                      Nama Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lokasi
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      QR Feedback
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      PJ Gedung
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      No Telepon
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
                        <p className="text-lg mb-2">Memuat data gedung...</p>
                      </div>
                    </td>
                  </tr>
                ) : gedungs.length > 0 ? (
                  gedungs.map((g) => (
                    <tr key={g.id_gedung} className="border-b border-gray-700/20 hover:bg-gray-700/20 transition-all duration-200">
                      <td className="p-4 text-gray-200 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                          {g.nama_gedung}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${
                          g.lokasi_gedung === 'jakarta' 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                            : 'bg-green-500/20 text-green-300 border-green-400/30'
                        }`}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {g.lokasi_gedung?.charAt(0).toUpperCase() + g.lokasi_gedung?.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-200">
                        {g.qrcode_feedback ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Tersedia
                            </span>
                            <span className="text-xs text-purple-400">
                              {isBase64QR(g.qrcode_feedback) ? 'Generated' : 'Legacy'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-400/30">
                            <X className="w-3 h-3 mr-1" />
                            Belum ada
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-200">
                        {g.pj?.nama ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-purple-400" />
                            </div>
                            <span className="font-medium">{g.pj.nama}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-200">
                        {g.pj?.no_telp ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-400" />
                            <span className="font-mono text-sm">{g.pj.no_telp}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(g)}
                            className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-200 group hover:shadow-lg"
                            disabled={loading}
                            title="Edit gedung"
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDelete(g.id_gedung)}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-200 group hover:shadow-lg"
                            disabled={loading}
                            title="Hapus gedung"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
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
                            <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Gagal memuat data gedung</p>
                            <button
                              onClick={fetchGedungs}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <Zap className="w-4 h-4" />
                              Coba Lagi
                            </button>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Belum ada gedung</p>
                            <p className="text-sm">Tambahkan gedung pertama dengan tombol di atas</p>
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