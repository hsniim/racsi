import { useEffect, useState } from 'react';
import { fetchDataTV } from '../utils/api';
import RoomCard from '../components/RoomCard';

function Home() {
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Fetch data dari backend setiap 1 menit
  useEffect(() => {
    const loadData = async () => {
      const dataTV = await fetchDataTV();
      console.log('Data TV:', JSON.stringify(dataTV, null, 2));
      setData(dataTV);
    };
    loadData();
    const interval = setInterval(loadData, 60000); // 1 menit
    return () => clearInterval(interval);
  }, []);

  // Update waktu realtime setiap detik
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]); // YYYY-MM-DD
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8)); // HH:MM:SS
    };
    updateTime();
    const timer = setInterval(updateTime, 1000); // update tiap detik
    return () => clearInterval(timer);
  }, []);

  function getStatusRuangan(ruangan, currentDate, currentTime) {
    if (!ruangan.jadwal_list || ruangan.jadwal_list.length === 0) return 'tidak_digunakan';

    let sedang = false;
    let akan = false;

    ruangan.jadwal_list.forEach(jadwal => {
      if (!jadwal.tanggal || jadwal.tanggal !== currentDate) return; // Hanya proses tanggal hari ini
      if (currentTime >= jadwal.waktu_mulai && currentTime <= jadwal.waktu_selesai) sedang = true;
      else if (currentTime < jadwal.waktu_mulai) akan = true;
    });

    if (sedang) return 'sedang_digunakan';
    if (akan) return 'akan_digunakan';
    return 'tidak_digunakan';
  }

  const unusedRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'tidak_digunakan');
  const usedRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'sedang_digunakan');
  const upcomingRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'akan_digunakan');

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-6xl font-bold text-center mb-8">RACSI - Lantai</h1>
      <div className="text-center mb-6">
        <p className="text-2xl">Tanggal: {currentDate}</p>
        <p className="text-2xl">Jam: {currentTime}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-600 p-4 rounded-lg shadow-lg">
          <h2 className="text-4xl font-semibold text-center mb-4">Tidak Digunakan</h2>
          {unusedRuangan.map((d) => (
            <RoomCard key={d.id_ruangan} room={d} type="tidak_digunakan" />
          ))}
        </div>
        <div className="bg-red-600 p-4 rounded-lg shadow-lg">
          <h2 className="text-4xl font-semibold text-center mb-4">Sedang Digunakan</h2>
          {usedRuangan.map((d) => (
            <RoomCard key={d.id_ruangan} room={d} type="sedang_digunakan" />
          ))}
        </div>
        <div className="bg-yellow-600 p-4 rounded-lg shadow-lg">
          <h2 className="text-4xl font-semibold text-center mb-4">Akan Digunakan</h2>
          {upcomingRuangan.map((d) => (
            <RoomCard key={d.id_ruangan} room={d} type="akan_digunakan" />
          ))}
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-2xl"></p>
        <p className="text-xl"></p>
      </div>
    </div>
  );
}

export default Home;
