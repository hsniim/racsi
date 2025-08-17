import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchRuangan, fetchJadwal, fetchDataTV } from './utils/api'; // Tambahkan baris ini

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import './index.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const dataTV = await fetchDataTV();
      setData(dataTV);
    };
    loadData();
    const interval = setInterval(loadData, 60000); // Perbarui setiap menit
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-primary p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-6">Racsi</h1>
      <Home data={data} />
    </div>
  );
}

export default App;