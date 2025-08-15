import { useEffect, useState } from 'react';
import { fetchDataTV } from '../utils/api';
import RoomCard from '../components/RoomCard';

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const dataTV = await fetchDataTV();
      console.log('Data TV:', JSON.stringify(dataTV, null, 2)); // tampilkan data dengan format rapi
      setData(dataTV);
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8); // HH:MM:SS
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

  function getStatusRuangan(ruangan, currentDate, currentTime) {
    const jadwalHariIni = ruangan.jadwal?.filter(j => j.tanggal === currentDate) || [];
    if (jadwalHariIni.length === 0) return 'tidak_digunakan';

    for (const j of jadwalHariIni) {
      if (currentTime >= j.waktu_mulai && currentTime <= j.waktu_selesai) return 'sedang_digunakan';
      if (currentTime < j.waktu_mulai) return 'akan_digunakan';
    }
    return 'tidak_digunakan';
  }

  const unusedRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'tidak_digunakan');
  const usedRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'sedang_digunakan');
  const upcomingRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'akan_digunakan');

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-6xl font-bold text-center mb-8">RACSI - Lantai</h1>
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
        <p className="text-2xl">QR Code Peminjaman: [QR Code]
        </p>
        <p className="text-xl">Keterangan Icon: Pengguna, Jam, Kapasitas</p>
      </div>
    </div>
  );
}

export default Home;