import { useEffect, useState } from 'react';
import { fetchRuangan } from '../utils/api';  // Ganti
import RoomCard from '../components/RoomCard';

function Home() {
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const ruangan = await fetchRuangan();  // Ganti
      console.log('Data Ruangan:', JSON.stringify(ruangan, null, 2));
      setData(ruangan);
    };
    loadData();
    const interval = setInterval(loadData, 60000);
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
  <div className="min-h-screen bg-gray-900 text-white flex justify-center">
    <div className="w-full max-w-5xl p-6">
      <h1 className="text-6xl font-bold text-center mb-8">RACSI - Lantai</h1>

      {/* Waktu realtime */}
      <div className="text-center mb-6">
        <p className="text-2xl">Tanggal: {currentDate}</p>
        <p className="text-2xl">Jam: {currentTime}</p>
      </div>

      {/* Section: Tidak Digunakan */}
      <div className="mb-8">
        <h2 className="text-xl font-bold px-4 py-2 bg-gray-800 rounded-md inline-block text-green-400 mb-4">
          Tidak Digunakan
        </h2>
        {unusedRuangan.length > 0 ? (
          unusedRuangan.map((d) => (
            <RoomCard key={d.id_ruangan} room={d} type="tidak_digunakan" />
          ))
        ) : (
          <p className="text-gray-400">Tidak ada ruangan.</p>
        )}
      </div>

      {/* Section: Sedang Digunakan */}
      <div className="mb-8">
        <h2 className="text-xl font-bold px-4 py-2 bg-gray-800 rounded-md inline-block text-red-400 mb-4">
          Sedang Digunakan
        </h2>
        {usedRuangan.length > 0 ? (
          usedRuangan.map((d) => (
            <RoomCard key={d.id_ruangan} room={d} type="sedang_digunakan" />
          ))
        ) : (
          <p className="text-gray-400">Tidak ada ruangan.</p>
        )}
      </div>

      {/* Section: Akan Digunakan */}
      <div>
        <h2 className="text-xl font-bold px-4 py-2 bg-gray-800 rounded-md inline-block text-yellow-400 mb-4">
          Akan Digunakan
        </h2>
        {upcomingRuangan.length > 0 ? (
          upcomingRuangan.map((d) => (
            <RoomCard key={d.id_ruangan} room={d} type="akan_digunakan" />
          ))
        ) : (
          <p className="text-gray-400">Tidak ada ruangan.</p>
        )}
      </div>
    </div>
  </div>
);
}

export default Home;
