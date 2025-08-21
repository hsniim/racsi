import { useEffect, useState } from 'react';
import { fetchRuangan } from '../utils/api';
import RoomCard from '../components/RoomCard';

function Home() {
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const ruangan = await fetchRuangan();
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
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)); // HH:MM
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

  // Komponen untuk section dengan infinite scroll otomatis
  const ScrollableSection = ({ title, rooms, maxCards, bgColor, textColor, scrollSpeed = 30 }) => {
    const shouldScroll = rooms.length > maxCards;
    const containerHeight = maxCards === 4 ? 'h-96' : 'h-96'; // 4 cards = h-96, 2 cards = h-96

    if (!shouldScroll) {
      return (
        <div className="min-w-0">
          <h2 className={`text-xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>
            {title}
          </h2>
          <div className="w-full">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard key={room.id_ruangan} room={room} type={bgColor} />
              ))
            ) : (
              <p className="text-gray-400 text-center">Tidak ada ruangan.</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-w-0">
        <h2 className={`text-xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>
          {title}
        </h2>
        <div className={`w-full ${containerHeight} overflow-hidden relative`}>
          <div 
            className={`auto-scroll-container auto-scroll-${bgColor}`}
            style={{
              animation: `autoScroll ${scrollSpeed}s linear infinite`,
              animationDelay: '1s'
            }}
          >
            {/* Render rooms dua kali untuk efek infinite */}
            {rooms.map((room) => (
              <RoomCard key={`first-${room.id_ruangan}`} room={room} type={bgColor} />
            ))}
            {rooms.map((room) => (
              <RoomCard key={`second-${room.id_ruangan}`} room={room} type={bgColor} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-h-screen w-full bg-gray-900 text-white">
      <div className="w-full max-w-none px-4 py-6">
        <h1 className="text-6xl font-bold text-center mb-8">RACSI - Lantai</h1>

        {/* Waktu realtime */}
        <div className="text-center mb-6">
          <p className="text-2xl">Tanggal: {currentDate}</p>
          <p className="text-2xl">Jam: {currentTime}</p>
        </div>

        {/* Container Flex untuk 3 kolom sejajar dengan proporsi berbeda */}
        <div className="flex gap-6 w-full">
          {/* Section: Tidak Digunakan - Maksimal 4 roomcard */}
          <div className="flex-[1]">
            <ScrollableSection
              title="Tidak Digunakan"
              rooms={unusedRuangan}
              maxCards={4}
              bgColor="tidak_digunakan"
              textColor="text-green-400"
              scrollSpeed={50} // Kecepatan scroll untuk "Tidak Digunakan" (lebih lambat)
            />
          </div>

          {/* Section: Sedang Digunakan - Lebih lebar, Maksimal 2 roomcard */}
          <div className="flex-[2]">
            <ScrollableSection
              title="Sedang Digunakan"
              rooms={usedRuangan}
              maxCards={2}
              bgColor="sedang_digunakan"
              textColor="text-red-400"
              scrollSpeed={25} // Kecepatan scroll untuk "Sedang Digunakan" (paling cepat)
            />
          </div>

          {/* Section: Akan Digunakan - Maksimal 2 roomcard */}
          <div className="flex-[1]">
            <ScrollableSection
              title="Akan Digunakan"
              rooms={upcomingRuangan}
              maxCards={2}
              bgColor="akan_digunakan"
              textColor="text-yellow-400"
              scrollSpeed={25} // Kecepatan scroll untuk "Akan Digunakan" (sedang)
            />
          </div>
        </div>
      </div>

      {/* Custom CSS untuk auto-scroll animation */}
      <style jsx>{`
        .auto-scroll-container {
          display: flex;
          flex-direction: column;
        }
        
        @keyframes autoScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        /* Pause animation on hover */
        .auto-scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default Home;