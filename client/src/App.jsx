import { useEffect, useState } from 'react';
import { fetchDataTV } from './utils/api';
import Home from './pages/Home';
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
    <div className="h-15 bg-headercolor p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-6">RACSI</h1>
      <Home data={data} />
    </div>
  );
}

export default App;