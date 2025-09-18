import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchRuangan, fetchJadwal } from "./utils/api";

// Halaman Publik
import Home from "./pages/Home";
import About from "./pages/About"
import TvDevicePage from "./pages/TvDevicePage";

// Halaman Admin
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gedung from "./pages/Gedung";
import Lantai from "./pages/Lantai";
import Ruangan from "./pages/Ruangan";
import Agenda from "./pages/Agenda";
import Riwayat from "./pages/Riwayat";
import TvDevice from "./pages/TvDevice";
import Feedback from "./pages/Feedback";

import AdminLayout from "./layouts/AdminLayout";

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
        {/* ----------------- ROUTE PUBLIK ----------------- */}
        <Route
          path="/"
          element={
            <div className="h-full w-full bg-primary">
              <div className="w-full px-4 py-6">
                <Home ruangan={ruangan} jadwal={jadwal} />
              </div>
            </div>
          }
        />
        <Route path="/about" element={<About />} />

        {/* Halaman TV Device (Publik, mirip Home tapi beda data) */}
        <Route
          path="/tv_device/:id_gedung/:id_lantai"
          element={<TvDevicePage />}
        />

        {/* Route TV untuk admin - dipindah ke luar parent route admin */}
        <Route 
          path="/admin/tv/:id_gedung/:id_lantai" 
          element={<TvDevicePage />} 
        />

        {/* ----------------- ROUTE ADMIN ----------------- */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gedung" element={<Gedung />} />
          <Route path="lantai" element={<Lantai />} />
          <Route path="ruangan" element={<Ruangan />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="riwayat" element={<Riwayat />} />
          <Route path="tv_device" element={<TvDevice />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;