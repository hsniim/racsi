// src/components/DeviceManager.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Monitor, Plus, Save, Trash2, Edit, X } from "lucide-react";
import { API_BASE_URL } from "../utils/api.js";

export default function DeviceManager() {
  const token = localStorage.getItem("token");

  const [devices, setDevices] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [filteredLantais, setFilteredLantais] = useState([]);
  const [form, setForm] = useState({ nama_device: "", id_gedung: "", id_lantai: "" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadAll = async () => {
    try {
      const [d, g, l] = await Promise.all([
        api.get("/tv-device"),
        api.get("/gedung"),
        api.get("/lantai"),
      ]);
      setDevices(d.data.data || []);
      setGedungs(g.data.data || []);
      setLantais(l.data.data || []);
      setFilteredLantais(l.data.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setMsg({ type: "error", text: "Gagal memuat data" });
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleGedungChange = (e) => {
    const selectedGedungId = e.target.value;
    setForm({ ...form, id_gedung: selectedGedungId, id_lantai: "" });
    setFilteredLantais(selectedGedungId ? lantais.filter(l => l.id_gedung == selectedGedungId) : lantais);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/tv-device/${editId}`, form);
        setMsg({ type: "success", text: "Device berhasil diperbarui" });
      } else {
        await api.post("/tv-device", form);
        setMsg({ type: "success", text: "Device berhasil ditambahkan" });
      }
      setForm({ nama_device: "", id_gedung: "", id_lantai: "" });
      setEditId(null);
      setFilteredLantais(lantais);
      await loadAll();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Gagal menyimpan" });
    }
  };

  const edit = (d) => {
    setEditId(d.id_device);
    setForm({ nama_device: d.nama_device, id_gedung: d.id_gedung, id_lantai: d.id_lantai });
    if (d.id_gedung) setFilteredLantais(lantais.filter(l => l.id_gedung == d.id_gedung));
  };

  const hapus = async (id) => {
    if (!confirm("Hapus device ini?")) return;
    try {
      await api.delete(`/tv-device/${id}`);
      await loadAll();
      setMsg({ type: "success", text: "Device berhasil dihapus" });
    } catch {
      setMsg({ type: "error", text: "Gagal menghapus device" });
    }
  };

  const batal = () => {
    setEditId(null);
    setForm({ nama_device: "", id_gedung: "", id_lantai: "" });
    setFilteredLantais(lantais);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-200">Kelola Device</h1>
      {msg.text && (
        <div className={`mb-4 p-3 rounded-xl border ${msg.type === "success"
            ? "bg-green-600/20 border-green-400/30 text-green-200"
            : "bg-red-600/20 border-red-400/30 text-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* FORM */}
      <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl p-6 mb-8">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
            placeholder="Nama Device"
            value={form.nama_device}
            onChange={e => setForm({ ...form, nama_device: e.target.value })}
            required />
          <select className="p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
            value={form.id_gedung}
            onChange={handleGedungChange}
            required>
            <option value="">-- Pilih Gedung --</option>
            {gedungs.map(g => <option key={g.id_gedung} value={g.id_gedung}>{g.nama_gedung}</option>)}
          </select>
          <select className="p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white"
            value={form.id_lantai}
            onChange={e => setForm({ ...form, id_lantai: e.target.value })}
            required disabled={!form.id_gedung}>
            <option value="">-- Pilih Lantai --</option>
            {filteredLantais.map(l => <option key={l.id_lantai} value={l.id_lantai}>Lantai {l.nomor_lantai}</option>)}
          </select>

          <div className="col-span-1 md:col-span-3 flex gap-2">
            {editId ? (
              <>
                <button type="button" onClick={batal}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2">
                  <X size={18}/> Batal
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2">
                  <Save size={18}/> Simpan Perubahan
                </button>
              </>
            ) : (
              <button type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2">
                <Plus size={18}/> Tambah Device
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-200 font-semibold">Daftar Device</h2>
          <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full border border-gray-600/30">
            {devices.length} Device
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="p-3 text-left text-gray-300">ID</th>
                <th className="p-3 text-left text-gray-300">Nama Device</th>
                <th className="p-3 text-left text-gray-300">Gedung</th>
                <th className="p-3 text-left text-gray-300">Lantai</th>
                <th className="p-3 text-center text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {devices.length ? devices.map(d => (
                <tr key={d.id_device} className="border-b border-gray-700/30 hover:bg-gray-700/30">
                  <td className="p-3 text-gray-200">{d.id_device}</td>
                  <td className="p-3 text-gray-200 flex items-center gap-2">
                    <Monitor size={16}/> {d.nama_device}
                  </td>
                  <td className="p-3 text-gray-200">{d.nama_gedung}</td>
                  <td className="p-3 text-gray-200">Lantai {d.nomor_lantai}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => edit(d)}
                      className="px-3 py-1 mr-2 bg-yellow-500/20 text-yellow-300 rounded-lg border hover:bg-yellow-500/30">
                      <Edit size={16} className="inline mr-1"/> Edit
                    </button>
                    <button onClick={() => hapus(d.id_device)}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border hover:bg-red-500/30">
                      <Trash2 size={16} className="inline mr-1"/> Hapus
                    </button>
                    <button onClick={() => window.open(`/tv_device/${d.id_gedung}/${d.id_lantai}`, "_blank")}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border hover:bg-blue-500/30 mr-2 ml-2">
                      <Monitor size={16} className="inline mr-1"/> Tampilkan
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Belum ada device</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
