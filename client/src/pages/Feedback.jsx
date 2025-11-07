import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, X, Star, ChevronDown, MessageSquare, User, Mail, Calendar, Building2, ThumbsUp, AlertCircle } from "lucide-react";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [ruangans, setRuangans] = useState([]);
  const [form, setForm] = useState({
    id_ruangan: "",
    nama_pengguna: "",
    email_pengguna: "",
    rating: "",
    komentar: "",
    kategori: "",
    tanggal_feedback: new Date().toISOString().split('T')[0],
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem("token");

  // Helper function untuk konversi yang lebih robust
  const parseRating = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }
    const num = parseFloat(value);
    return isNaN(num) ? "" : num;
  };

  const fetchRuangans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ruangan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRuangans(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch ruangan:", err);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Response feedback:", res.data);
      
      let feedbackData = [];
      if (res.data && res.data.data) {
        feedbackData = res.data.data;
      } else if (Array.isArray(res.data)) {
        feedbackData = res.data;
      }
      
      setFeedbacks(feedbackData);
      setError("");
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      
      if (err.response) {
        const errorMsg = err.response.data?.message || `Server error: ${err.response.status}`;
        setError(errorMsg);
        console.error("Server error details:", err.response.data);
      } else if (err.request) {
        setError("Tidak bisa terhubung ke server. Pastikan server backend berjalan.");
      } else {
        setError("Terjadi kesalahan tak terduga");
      }
      
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchRuangans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation yang lebih ketat
      if (!form.id_ruangan || !form.nama_pengguna || !form.tanggal_feedback || !form.rating || !form.kategori || !form.komentar) {
        setError("Ruangan, nama pengguna, rating, kategori, komentar, dan tanggal feedback wajib diisi!");
        setLoading(false);
        return;
      }

      // Ensure rating is a number
      const submitData = { 
        ...form,
        rating: parseFloat(form.rating)
      };
      
      console.log("Submit data:", submitData);

      if (editId) {
        await axios.put(`http://localhost:5000/api/feedback/${editId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Feedback berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/feedback", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Feedback berhasil ditambahkan!");
      }

      // Reset form
      setForm({
        id_ruangan: "",
        nama_pengguna: "",
        email_pengguna: "",
        rating: "",
        komentar: "",
        kategori: "",
        tanggal_feedback: new Date().toISOString().split('T')[0],
      });
      setEditId(null);
      setError("");
      setShowForm(false);
      
      await fetchFeedbacks();
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Submit error:", err);
      
      if (err.response) {
        setError(err.response.data?.message || "Gagal menyimpan feedback");
        console.error("Submit error details:", err.response.data);
      } else {
        setError("Tidak bisa terhubung ke server");
      }
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (f) => {
    setEditId(f.id_feedback);
    setForm({
      id_ruangan: f.id_ruangan || "",
      nama_pengguna: f.nama_pengguna || "",
      email_pengguna: f.email_pengguna || "",
      rating: f.rating ? f.rating.toString() : "",
      komentar: f.komentar || "",
      kategori: f.kategori || "",
      tanggal_feedback: f.tanggal_feedback
        ? f.tanggal_feedback.split("T")[0]
        : new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus feedback ini?")) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Feedback berhasil dihapus!");
      await fetchFeedbacks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Gagal menghapus feedback");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowForm(false);
    setForm({
      id_ruangan: "",
      nama_pengguna: "",
      email_pengguna: "",
      rating: "",
      komentar: "",
      kategori: "",
      tanggal_feedback: new Date().toISOString().split('T')[0],
    });
    setError("");
  };

  const getNamaRuangan = (id) => {
    const r = ruangans.find((item) => item.id_ruangan === id);
    return r ? `${r.nama_gedung} - Lt ${r.nomor_lantai} - ${r.nama_ruangan}` : `ID: ${id}`;
  };

  // Improved star display function
  const renderStars = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;
    const emptyStars = 5 - Math.ceil(ratingValue);

    return (
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <Star 
              className="w-4 h-4 text-yellow-400 absolute top-0 left-0"
              fill="currentColor"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300"
          />
        ))}
        
        <span className="text-sm text-gray-400 ml-2">
          {ratingValue.toFixed(1)}
        </span>
      </div>
    );
  };

  const getCategoryIcon = (kategori) => {
    switch (kategori) {
      case 'fasilitas':
        return '🏢';
      case 'kebersihan':
        return '🧹';
      case 'kenyamanan':
        return '🛋️';
      case 'pelayanan':
        return '🤝';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (kategori) => {
    switch (kategori) {
      case 'fasilitas':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'kebersihan':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'kenyamanan':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'pelayanan':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
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
      </div>

      <div className="relative z-10 w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            Kelola Feedback
          </h1>
          <p className="text-xl text-gray-300">
            Tambah, edit, dan kelola feedback pengguna ruangan
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>{error}</div>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-200 backdrop-blur-sm">
            <div className="flex items-start">
              <ThumbsUp className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-200 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300 mr-3"></div>
              <div>Memproses...</div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">
                  {editId ? "Edit Feedback" : "Feedback Baru"}
                </h2>
                <p className="text-gray-400">
                  {editId ? "Perbarui feedback pengguna" : "Tambah feedback dari pengguna ruangan"}
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
              {showForm ? 'Tutup Form' : 'Tambah Feedback'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ruangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Pilih Ruangan <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_ruangan}
                      onChange={(e) => setForm({ ...form, id_ruangan: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="">-- Pilih Ruangan --</option>
                      {ruangans.map((r) => (
                        <option key={r.id_ruangan} value={r.id_ruangan}>
                          {r.nama_gedung} - Lt {r.nomor_lantai} - {r.nama_ruangan}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tanggal Feedback <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.tanggal_feedback}
                    onChange={(e) => setForm({ ...form, tanggal_feedback: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Nama Pengguna */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nama Pengguna <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama pengguna"
                    value={form.nama_pengguna}
                    onChange={(e) => setForm({ ...form, nama_pengguna: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Masukkan email (opsional)"
                    value={form.email_pengguna}
                    onChange={(e) => setForm({ ...form, email_pengguna: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating (1-5) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.rating}
                      onChange={(e) => {
                        console.log("Rating selected:", e.target.value);
                        setForm({ ...form, rating: e.target.value });
                      }}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">-- Pilih Rating --</option>
                      <option value="1.0">⭐ 1.0 - Sangat Buruk</option>
                      <option value="1.5">⭐ 1.5</option>
                      <option value="2.0">⭐⭐ 2.0 - Buruk</option>
                      <option value="2.5">⭐⭐ 2.5</option>
                      <option value="3.0">⭐⭐⭐ 3.0 - Cukup</option>
                      <option value="3.5">⭐⭐⭐ 3.5</option>
                      <option value="4.0">⭐⭐⭐⭐ 4.0 - Baik</option>
                      <option value="4.5">⭐⭐⭐⭐ 4.5</option>
                      <option value="5.0">⭐⭐⭐⭐⭐ 5.0 - Sangat Baik</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.kategori}
                      onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">-- Pilih Kategori --</option>
                      <option value="fasilitas">🏢 Fasilitas</option>
                      <option value="kebersihan">🧹 Kebersihan</option>
                      <option value="kenyamanan">🛋️ Kenyamanan</option>
                      <option value="pelayanan">🤝 Pelayanan</option>
                      <option value="lainnya">📝 Lainnya</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Komentar */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Komentar <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Tulis komentar atau masukan tentang ruangan..."
                  value={form.komentar}
                  onChange={(e) => setForm({ ...form, komentar: e.target.value })}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-400/30 rounded-xl flex items-center gap-2 hover:bg-red-600/30 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" /> 
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {loading ? "Memproses..." : (editId ? "Update Feedback" : "Tambah Feedback")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700/30">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-200">Daftar Feedback</h2>
                <p className="text-gray-400">Semua feedback dari pengguna ruangan</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30 font-medium">
              Total: {feedbacks.length} Feedback
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/30">
                  <th className="p-4 text-left text-sm font-medium text-gray-300 first:rounded-tl-xl">No</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Ruangan</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Tanggal</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Nama</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Email</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Rating</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Kategori</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-300">Komentar</th>
                  <th className="p-4 text-center text-sm font-medium text-gray-300 last:rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mb-4"></div>
                        <p>Memuat data feedback...</p>
                      </div>
                    </td>
                  </tr>
                ) : feedbacks.length > 0 ? (
                  feedbacks.map((f, index) => (
                    <tr
                      key={f.id_feedback}
                      className="border-b border-gray-700/20 hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="p-4 text-gray-300 font-medium">
                        {index + 1}
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="max-w-xs">
                          <div className="font-medium text-white truncate">
                            {getNamaRuangan(f.id_ruangan)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="text-sm">
                          {f.tanggal_feedback
                            ? new Date(f.tanggal_feedback).toLocaleDateString("id-ID", {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : "-"}
                        </div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="font-medium">{f.nama_pengguna}</div>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="text-sm">{f.email_pengguna || "-"}</div>
                      </td>
                      <td className="p-4">
                        {renderStars(f.rating)}
                      </td>
                      <td className="p-4 text-gray-200">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(f.kategori)}`}>
                          {getCategoryIcon(f.kategori)} {f.kategori || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-200">
                        <div className="max-w-xs">
                          <div className="truncate text-sm" title={f.komentar}>
                            {f.komentar || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(f)}
                            className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-200 group hover:shadow-lg"
                            disabled={loading}
                            title="Edit feedback"
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id_feedback)}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-200 group hover:shadow-lg"
                            disabled={loading}
                            title="Hapus feedback"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          {error ? "Gagal memuat data feedback" : "Belum ada feedback"}
                        </p>
                        <p className="text-sm">
                          {error ? "Periksa koneksi server Anda" : "Tambahkan feedback pertama dengan form di atas"}
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
    </div>
  );
}