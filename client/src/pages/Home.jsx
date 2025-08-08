import { useEffect, useState } from 'react';
import { fetchRuangan, fetchJadwal } from '../utils/api';
import RoomCard from '../components/RoomCard';

function Home() {
  const [ruangan, setRuangan] = useState([]);
  const [jadwal, setJadwal] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const ruanganData = await fetchRuangan();
      const jadwalData = await fetchJadwal();
      console.log('Data Ruangan:', ruanganData); // Debug log
      console.log('Data Jadwal:', jadwalData);
      setRuangan(ruanganData);
      setJadwal(jadwalData);
    };
    loadData();
    const interval = setInterval(loadData, 60000); // Perbarui setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  // Dapatkan waktu saat ini (21:45 WIB)
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }); // Format: HH:MM:SS

  // Logika untuk bagi ruangan berdasarkan status dan jadwal
  const unusedRuangan = ruangan.filter((r) => {
    const roomJadwal = jadwal.find((j) => j.id_ruangan === r.id_ruangan);
    if (!roomJadwal) return r.status === 'kosong';
    const start = roomJadwal.waktu_mulai;
    const end = roomJadwal.waktu_selesai;
    return r.status === 'kosong' || (currentTime > end); // Selesai digunakan
  });

  const usedRuangan = ruangan.filter((r) => {
    const roomJadwal = jadwal.find((j) => j.id_ruangan === r.id_ruangan);
    if (!roomJadwal) return r.status === 'terpakai';
    const start = roomJadwal.waktu_mulai;
    const end = roomJadwal.waktu_selesai;
    return r.status === 'terpakai' || (currentTime >= start && currentTime <= end); // Sedang digunakan
  });

  const upcomingRuangan = ruangan.filter((r) => {
    const roomJadwal = jadwal.find((j) => j.id_ruangan === r.id_ruangan);
    if (!roomJadwal) return false;
    const start = roomJadwal.waktu_mulai;
    return currentTime < start; // Akan digunakan
  });

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bodycolor p-4 rounded-lg shadow-lg">
          <h2 className="text-4xl font-semibold text-center mb-4">Tidak Digunakan</h2>
          {unusedRuangan.length === 0 ? (
            <p className="text-center">Tidak ada ruangan.</p>
          ) : (
            unusedRuangan.map((r) => <RoomCard key={r.id_ruangan} room={r} />)
          )}
        </div>
        <div className="bg-bodycolor p-4 rounded-lg shadow-lg">
          <h2 className="text-4xl font-semibold text-center mb-4">Sedang Digunakan</h2>
          {usedRuangan.length === 0 ? (
            <p className="text-center">Tidak ada ruangan.</p>
          ) : (
            usedRuangan.map((r) => <RoomCard key={r.id_ruangan} room={r}/>)
          )}
        </div>
        <div className="bg-bodycolor p-4 rounded-lg shadow-lg">
          <h2 className="text-4xl font-semibold text-center mb-4">Akan Digunakan</h2>
          {upcomingRuangan.length === 0 ? (
            <p className="text-center">Tidak ada ruangan.</p>
          ) : (
            upcomingRuangan.map((r) => {
              const roomJadwal = jadwal.find((j) => j.id_ruangan === r.id_ruangan);
              return (
                <RoomCard
                  key={r.id_ruangan}
                  room={r}
                  jadwal={`${roomJadwal.waktu_mulai} - ${roomJadwal.waktu_selesai}`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;