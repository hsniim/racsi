import { useEffect, useState } from 'react';
import { fetchRuangan, fetchJadwal } from './utils/api';
import Home from './pages/Home';
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
    <div className="min-h-screen bg-primary p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-6">Racsi</h1>
      <Home ruangan={ruangan} jadwal={jadwal} />
    </div>
  );
}

export default App;