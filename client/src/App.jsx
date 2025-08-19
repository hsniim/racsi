import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchRuangan, fetchJadwal } from "./utils/api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gedung from "./pages/Gedung";
import Lantai from "./pages/Lantai";
import Ruangan from "./pages/Ruangan";
import Kegiatan from "./pages/Kegiatan";
import Jadwal from "./pages/Jadwal";
import Riwayat from "./pages/Riwayat";

import AdminLayout from "./layouts/AdminLayout"; // ⬅️ Import Layout

import "./index.css";

function App() {
  const [ruangan, setRuangan] = useState([]);
  const [jadwal, setJadwal] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const ruanganData = await fetchRuangan();
      const jadwalData = await fetchJadwal();
      setRuangan(ruanganData);
      setJadwal(jadwalData);
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Halaman Utama */}
<Route
  path="/"
  element={
    <div className="min-h-screen bg-primary p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-6">
        Racsi
      </h1>
      <Home ruangan={ruangan} jadwal={jadwal} />
    </div>
  }
/>


        {/* Halaman Login Admin */}
        <Route path="/admin" element={<Login />} />

        {/* Semua halaman admin pakai AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gedung" element={<Gedung />} />
          <Route path="lantai" element={<Lantai />} />
          <Route path="ruangan" element={<Ruangan />} />
          <Route path="kegiatan" element={<Kegiatan />} />
          <Route path="jadwal" element={<Jadwal />} />
          <Route path="riwayat" element={<Riwayat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;