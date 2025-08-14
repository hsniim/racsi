import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchRuangan, fetchJadwal } from './utils/api';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import './index.css';

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
    const interval = setInterval(loadData, 60000); // Perbarui setiap 1 menit
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
              <h1 className="text-4xl font-bold text-center text-white mb-6">Racsi</h1>
              <Home ruangan={ruangan} jadwal={jadwal} />
            </div>
          }
        />

        {/* Halaman Login Admin */}
        <Route path="/admin" element={<Login />} />

        {/* Halaman Dashboard Admin */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
