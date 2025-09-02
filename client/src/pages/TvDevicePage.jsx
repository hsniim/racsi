import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchRuanganByGedungLantaiTv,
  fetchHeaderDataByIds,
  fetchPjGedung,
} from "../utils/api";
import RoomCard from "../components/RoomCard";

function TvDevicePage() {
  // Pastikan nama param sama dengan route: :id_gedung & :id_lantai
  const { id_gedung, id_lantai } = useParams();
  const [data, setData] = useState([]);
  const [headerData, setHeaderData] = useState({
    nama_gedung: "Loading...",
    nomor_lantai: id_lantai ?? 1,
    pj_lantaipagi: "",
    pj_lantaisiang: "",
  });
  const [pjGedungData, setPjGedungData] = useState({
    nama: "",
    no_telp: "",
    link_peminjaman: "",
    qrcodepath_pinjam: "",
    qrcodepath_kontak: "",
  });
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(
          `Fetching data ruangan dari endpoint: /api/ruangan/tv/with-jadwal?id_gedung=${id_gedung}&id_lantai=${id_lantai}`
        );

        // Ambil ruangan publik untuk TV
        const raw = await fetchRuanganByGedungLantaiTv(id_gedung, id_lantai);
        let ruanganList = [];
        if (Array.isArray(raw)) ruanganList = raw;
        else if (raw && Array.isArray(raw.data)) ruanganList = raw.data;
        else ruanganList = Array.isArray(raw) ? raw : [];
        setData(ruanganList);
        console.log("Data TvDevicePage:", ruanganList);
      } catch (err) {
        console.error("Gagal fetch ruangan TV:", err);
        setData([]);
      }

      // Ambil header spesifik (jika endpoint tersedia)
      try {
        const header = await fetchHeaderDataByIds(id_gedung, id_lantai);
        if (header && typeof header === 'object') {
          setHeaderData(prev => ({
            ...prev,
            nama_gedung: header.nama_gedung ?? prev.nama_gedung,
            nomor_lantai: header.nomor_lantai ?? prev.nomor_lantai,
            pj_lantaipagi: header.pj_lantaipagi ?? prev.pj_lantaipagi,
            pj_lantaisiang: header.pj_lantaisiang ?? prev.pj_lantaisiang
          }));
        }
      } catch (err) {
        console.error("Gagal fetch header by ids:", err);
      }

      // Ambil PJ Gedung (sama seperti Home)
      try {
        const pj = await fetchPjGedung();
        if (Array.isArray(pj) && pj.length > 0) {
          setPjGedungData(pj[0]);
        }
      } catch (err) {
        console.error("Gagal fetch PJ Gedung:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [id_gedung, id_lantai]);

  // Update waktu realtime
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toISOString().split("T")[0]);
      setCurrentTime(now.toLocaleTimeString("en-GB", { hour12: false }).slice(0, 5));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  function getStatusRuangan(ruangan, currentDate, currentTime) {
    if (!ruangan?.jadwal_list || ruangan.jadwal_list.length === 0) return "tidak_digunakan";

    let sedang = false;
    let akan = false;

    ruangan.jadwal_list.forEach((jadwal) => {
      if (!jadwal?.tanggal || jadwal.tanggal !== currentDate) return;

      if (currentTime >= jadwal.waktu_mulai && currentTime <= jadwal.waktu_selesai) sedang = true;
      else if (currentTime < jadwal.waktu_mulai) akan = true;
    });

    if (sedang) return "sedang_digunakan";
    if (akan) return "akan_digunakan";
    return "tidak_digunakan";
  }

  const unusedRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'tidak_digunakan');
  const usedRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'sedang_digunakan');
  const upcomingRuangan = data.filter(d => getStatusRuangan(d, currentDate, currentTime) === 'akan_digunakan');

  const ScrollableSection = ({ title, rooms, maxCards, bgColor, textColor, scrollSpeed = 30 }) => {
    const list = Array.isArray(rooms) ? rooms : [];
    const shouldScroll = list.length > maxCards;
    const getCardHeight = () => {
      switch (bgColor) {
        case "tidak_digunakan": return 117;
        case "akan_digunakan": return 195;
        case "sedang_digunakan": return 195;
        default: return 120;
      }
    };
    const cardHeight = getCardHeight();
    const containerHeight = maxCards * cardHeight;

    if (!shouldScroll) {
      return (
        <div className="min-w-0">
          <h2 className={`text-xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>{title}</h2>
          <div className="w-full overflow-hidden" style={{ height: `${containerHeight}px` }}>
            <div className="flex flex-col">
              {list.length > 0 ? (
                list.slice(0, maxCards).map((room) => (
                  <div key={room.id_ruangan} style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }} className="flex-shrink-0">
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
        <h2 className={`text-xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>{title}</h2>
        <div className="w-full overflow-hidden relative" style={{ height: `${containerHeight}px` }}>
          <div className={`scroll-${bgColor} absolute top-0 left-0 w-full`} style={{ '--scroll-speed': `${scrollSpeed}s` }}>
            <div className="room-set">
              {list.map((room) => (
                <div key={`first-${room.id_ruangan}`} style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }} className="flex-shrink-0">
                  <RoomCard room={room} type={bgColor} />
                </div>
              ))}
            </div>
            <div className="room-set">
              {list.map((room) => (
                <div key={`second-${room.id_ruangan}`} style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }} className="flex-shrink-0">
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
    <div className="h-full w-full bg-primary text-white">
      <div className="w-full max-w-none px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-7 p-6 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4 transform rotate-45">
              <div className="w-6 h-6 bg-gray-800 rounded-sm transform -rotate-45 flex items-center justify-center">
                <div className="w-3 h-2 bg-white rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white">{headerData.nama_gedung}</h1>
          </div>

          <div className="text-center">
            <p className="text-3xl text-white font-medium">Lantai {headerData.nomor_lantai}</p>
            <p className="text-2xl text-gray-300">{headerData.pj_lantaipagi} | {headerData.pj_lantaisiang}</p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold text-white">{currentTime}</p>
            <p className="text-base text-gray-300">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Konten */}
        <div className="flex gap-6 w-full">
          <div className="flex-[1]">
            <ScrollableSection title="Tidak Digunakan" rooms={unusedRuangan} maxCards={5} bgColor="tidak_digunakan" textColor="text-green-400" scrollSpeed={45} />
          </div>
          <div className="flex-[2]">
            <ScrollableSection title="Sedang Digunakan" rooms={usedRuangan} maxCards={3} bgColor="sedang_digunakan" textColor="text-red-400" scrollSpeed={30} />
          </div>
          <div className="flex-[1]">
            <ScrollableSection title="Akan Digunakan" rooms={upcomingRuangan} maxCards={3} bgColor="akan_digunakan" textColor="text-yellow-400" scrollSpeed={30} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 p-4 bg-gray-800 rounded-lg mx-auto max-w-2xl">
          <div className="flex justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20">
                <img className="rounded-md w-full h-full object-cover" src={pjGedungData.qrcodepath_kontak} alt="QR Kontak PJ" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-white leading-tight">PJ Gedung</h3>
                <p className="text-md text-gray-300 -mt-1">{pjGedungData.no_telp}</p>
                <p className="text-md text-gray-300 mt-1">{pjGedungData.nama}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20">
                <img className="rounded-md w-full h-full object-cover" src={pjGedungData.qrcodepath_pinjam} alt="QR Peminjaman" />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-semibold text-white leading-none">Peminjaman<br />Ruang</h3>
                <p className="text-md text-gray-300">{pjGedungData.link_peminjaman}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animasi scroll */}
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
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
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

export default TvDevicePage;
