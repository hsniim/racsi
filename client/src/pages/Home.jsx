import { useEffect, useState } from 'react';
import { fetchRuangan, fetchHeaderData } from '../utils/api';
import RoomCard from '../components/RoomCard';

function Home() {
  const [data, setData] = useState([]);
  const [headerData, setHeaderData] = useState({
    nama_gedung: "RACSI",
    nomor_lantai: 3,
    pj_lantaipagi: "Pak Budi",
    pj_lantaisiang: "Pak Nasir"
  });
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // Load ruangan data
      const ruangan = await fetchRuangan();
      console.log('Data Ruangan:', JSON.stringify(ruangan, null, 2));
      setData(ruangan);

      // Load header data
      const header = await fetchHeaderData();
      console.log('Data Header:', header);
      setHeaderData(header);
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
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  function getStatusRuangan(ruangan, currentDate, currentTime) {
    if (!ruangan.jadwal_list || ruangan.jadwal_list.length === 0) return 'tidak_digunakan';
    
    let sedang = false;
    let akan = false;
    
    ruangan.jadwal_list.forEach(jadwal => {
      if (!jadwal.tanggal || jadwal.tanggal !== currentDate) return;
      
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

    const getCardHeight = () => {
      switch (bgColor) {
        case 'tidak_digunakan':
          return 117;
        case 'akan_digunakan':
          return 195;
        case 'sedang_digunakan':
          return 195;
        default:
          return 120;
      }
    };

    const cardHeight = getCardHeight();
    const containerHeight = maxCards * cardHeight;

    if (!shouldScroll) {
      return (
        <div className="min-w-0">
          <h2 className={`text-xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>
            {title}
          </h2>
          <div className="w-full overflow-hidden" style={{ height: `${containerHeight}px` }}>
            <div className="flex flex-col">
              {rooms.length > 0 ? (
                rooms.slice(0, maxCards).map((room, index) => (
                  <div
                    key={room.id_ruangan}
                    style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }}
                    className="flex-shrink-0"
                  >
                    <RoomCard room={room} type={bgColor} />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center">Tidak ada ruangan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-w-0">
        <h2 className={`text-xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>
          {title}
        </h2>
        <div
          className="w-full overflow-hidden relative"
          style={{ height: `${containerHeight}px` }}
        >
          <div
            className={`scroll-${bgColor} absolute top-0 left-0 w-full`}
            style={{ '--scroll-speed': `${scrollSpeed}s` }}
          >
            {/* First set of rooms */}
            <div className="room-set">
              {rooms.map((room, index) => (
                <div
                  key={`first-${room.id_ruangan}`}
                  style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }}
                  className="flex-shrink-0"
                >
                  <RoomCard room={room} type={bgColor} />
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="room-set">
              {rooms.map((room, index) => (
                <div
                  key={`second-${room.id_ruangan}`}
                  style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }}
                  className="flex-shrink-0"
                >
                  <RoomCard room={room} type={bgColor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-h-screen h-screen w-full bg-primary text-white">
      <div className="w-full max-w-none px-4 py-6">
        {/* Header dengan Dynamic Data */}
        <div className='flex justify-between items-center mb-7 p-6 bg-gray-800 rounded-lg'>
          {/* Logo dan Title */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4 transform rotate-45">
              <div className="w-6 h-6 bg-gray-800 rounded-sm transform -rotate-45 flex items-center justify-center">
                <div className="w-3 h-2 bg-white rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white">
              {headerData.nama_gedung}
            </h1>
          </div>

          {/* Info Tengah */}
          <div className="text-center">
            <p className="text-3xl text-white font-medium">
              Lantai {headerData.nomor_lantai}
            </p>
            <p className="text-2xl text-gray-300">
              {headerData.pj_lantaipagi} | {headerData.pj_lantaisiang}
            </p>
          </div>

          {/* Waktu */}
          <div className="text-right">
            <p className="text-4xl font-bold text-white">{currentTime}</p>
            <p className="text-base text-gray-300">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Container Flex untuk 3 kolom sejajar dengan proporsi berbeda */}
        <div className="flex gap-6 w-full">
          {/* Section: Tidak Digunakan - Maksimal 4 roomcard */}
          <div className="flex-[1]">
            <ScrollableSection
              title="Tidak Digunakan"
              rooms={unusedRuangan}
              maxCards={5}
              bgColor="tidak_digunakan"
              textColor="text-green-400"
              scrollSpeed={45}
            />
          </div>

          {/* Section: Sedang Digunakan - Lebih lebar, Maksimal 3 roomcard */}
          <div className="flex-[2]">
            <ScrollableSection
              title="Sedang Digunakan"
              rooms={usedRuangan}
              maxCards={3}
              bgColor="sedang_digunakan"
              textColor="text-red-400"
              scrollSpeed={30}
            />
          </div>

          {/* Section: Akan Digunakan - Maksimal 3 roomcard */}
          <div className="flex-[1]">
            <ScrollableSection
              title="Akan Digunakan"
              rooms={upcomingRuangan}
              maxCards={3}
              bgColor="akan_digunakan"
              textColor="text-yellow-400"
              scrollSpeed={30}
            />
          </div>
        </div>
      </div>

      {/* Global CSS untuk persistent animation */}
      <style>{`
        .scroll-tidak_digunakan,
        .scroll-sedang_digunakan,
        .scroll-akan_digunakan {
          display: flex;
          flex-direction: column;
          animation: continuousScroll var(--scroll-speed) linear infinite;
          animation-fill-mode: forwards;
        }

        .scroll-tidak_digunakan:hover,
        .scroll-sedang_digunakan:hover,
        .scroll-akan_digunakan:hover {
          animation-play-state: paused;
        }

        .room-set {
          display: flex;
          flex-direction: column;
        }

        @keyframes continuousScroll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }

        /* Force hardware acceleration untuk smoother animation */
        .scroll-tidak_digunakan,
        .scroll-sedang_digunakan,
        .scroll-akan_digunakan {
          backface-visibility: hidden;
          perspective: 1000px;
          transform-style: preserve-3d;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}

export default Home;