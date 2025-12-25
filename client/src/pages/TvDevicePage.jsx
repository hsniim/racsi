import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
import { API_BASE_URL } from '../utils/api.js';
  fetchRuanganByGedungLantaiTv,
  fetchHeaderDataByIds,
  fetchPjGedungByGedung,
} from "../utils/api";
import RoomCard from "../components/RoomCard";
import FeedbackCard from "../components/FeedbackCard";

function TvDevicePage() {
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

  // Helper function to convert DB path to full URL
  const convertPathToURL = (qrPath) => {
    if (!qrPath) return null;
    
    // Handle Buffer object from JSON {type: 'Buffer', data: Array}
    if (typeof qrPath === 'object' && qrPath.type === 'Buffer' && Array.isArray(qrPath.data)) {
      try {
        qrPath = String.fromCharCode.apply(null, qrPath.data);
      } catch (e) {
        console.error('Error converting Buffer to string:', e);
        return null;
      }
    }
    
    // Handle ArrayBuffer
    if (qrPath instanceof ArrayBuffer) {
      const decoder = new TextDecoder();
      qrPath = decoder.decode(qrPath);
    }
    
    // Convert Buffer-like objects to string (fallback)
    if (typeof qrPath === 'object' && qrPath.data && Array.isArray(qrPath.data)) {
      try {
        qrPath = String.fromCharCode.apply(null, qrPath.data);
      } catch (e) {
        console.error('Error converting data array to string:', e);
        return null;
      }
    }
    
    // Jika sudah data:image atau http, return as is
    if (typeof qrPath === 'string' && (qrPath.startsWith('data:image') || qrPath.startsWith('http'))) {
      return qrPath;
    }
    
    // Jika sudah dimulai dengan /uploads, tambahkan base URL
    if (typeof qrPath === 'string' && qrPath.startsWith('/uploads')) {
      return `${API_BASE_URL.replace('/api', '')}${qrPath}`;
    }
    
    // Default fallback - assume it's just filename
    if (typeof qrPath === 'string' && qrPath.length > 0) {
      return `${API_BASE_URL.replace('/api', '')}/uploads/${qrPath}`;
    }
    
    return null;
  };

  // Force fullscreen on component mount
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Fungsi untuk menentukan status ruangan
  // GANTI fungsi getStatusRuangan di TvDevicePage.jsx dengan ini:

function getStatusRuangan(ruangan, currentDate, currentTime) {
  if (!ruangan?.jadwal_list || ruangan.jadwal_list.length === 0) {
    return "tidak_digunakan";
  }

  const currentMinutes = timeToMinutes(currentTime);
  
  let sedang = false;
  let akan = false;

  // Filter jadwal untuk hari ini saja
  const todaySchedules = ruangan.jadwal_list.filter(jadwal => {
    if (!jadwal?.tanggal) return false;
    
    // Normalize tanggal untuk perbandingan
    const jadwalDate = jadwal.tanggal.split('T')[0]; // Ambil hanya YYYY-MM-DD
    
    console.log(`Comparing dates - Jadwal: ${jadwalDate}, Current: ${currentDate}`);
    
    return jadwalDate === currentDate;
  });

  console.log(`Room ${ruangan.nama_ruangan}: Found ${todaySchedules.length} schedules for today (${currentDate})`);

  // Jika tidak ada jadwal hari ini, status tidak digunakan
  if (todaySchedules.length === 0) {
    return "tidak_digunakan";
  }

  // Cek setiap jadwal hari ini
  todaySchedules.forEach((jadwal) => {
    if (!jadwal.waktu_mulai || !jadwal.waktu_selesai) {
      console.warn(`Invalid time in jadwal for room ${ruangan.nama_ruangan}`);
      return;
    }

    const startMinutes = timeToMinutes(jadwal.waktu_mulai);
    const endMinutes = timeToMinutes(jadwal.waktu_selesai);

    console.log(`Room ${ruangan.nama_ruangan}: Schedule ${jadwal.waktu_mulai}-${jadwal.waktu_selesai}, Current time minutes: ${currentMinutes}`);

    // Cek apakah sedang berlangsung
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      console.log(`Room ${ruangan.nama_ruangan}: SEDANG DIGUNAKAN`);
      sedang = true;
    } 
    // Cek apakah akan digunakan (dalam 2 jam ke depan)
    else if (currentMinutes < startMinutes && (startMinutes - currentMinutes) <= 360) {
      console.log(`Room ${ruangan.nama_ruangan}: AKAN DIGUNAKAN`);
      akan = true;
    }
  });
  
  if (sedang) {
    return "sedang_digunakan";
  } else if (akan) {
    return "akan_digunakan";
  } else {
    return "tidak_digunakan";
  }
}

function timeToMinutes(timeString) {
  if (!timeString) {
    return 0;
  }
  
  // Handle format HH:MM:SS atau HH:MM
  const parts = timeString.split(':');
  if (parts.length < 2) {
    return 0;
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return 0;
  }
  
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes;
}

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await fetchRuanganByGedungLantaiTv(id_gedung, id_lantai);
        let ruanganList = [];
        if (Array.isArray(raw)) ruanganList = raw;
        else if (raw && Array.isArray(raw.data)) ruanganList = raw.data;
        else ruanganList = Array.isArray(raw) ? raw : [];
        
        setData(ruanganList);

      } catch (err) {
        console.error("ERROR fetching ruangan TV:", err);
        setData([]);
      }

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
        console.error("Gagal fetch header:", err);
      }

      try {
        const pj = await fetchPjGedungByGedung(id_gedung);
        console.log("Raw PJ Gedung data:", pj);
        
        if (Array.isArray(pj) && pj.length > 0) {
          const pjRaw = pj[0];
          
          // FIXED: Handle both field names and convert to URLs
          const qrPeminjaman = pjRaw.qrcode_peminjaman || pjRaw.qrcodepath_pinjam;
          const qrKontak = pjRaw.qrcode_pjgedung || pjRaw.qrcodepath_kontak;
          
          console.log("QR Peminjaman raw:", qrPeminjaman);
          console.log("QR Kontak raw:", qrKontak);
          
          const processedPJ = {
            nama: pjRaw.nama || "",
            no_telp: pjRaw.no_telp || "",
            link_peminjaman: pjRaw.link_peminjaman || "",
            qrcodepath_pinjam: convertPathToURL(qrPeminjaman),
            qrcodepath_kontak: convertPathToURL(qrKontak),
          };
          
          console.log("Processed PJ Gedung data:", processedPJ);
          console.log("QR Peminjaman URL:", processedPJ.qrcodepath_pinjam);
          console.log("QR Kontak URL:", processedPJ.qrcodepath_kontak);
          
          setPjGedungData(processedPJ);
        } else {
          console.log("No PJ Gedung data found");
          setPjGedungData({
            nama: "", no_telp: "", link_peminjaman: "",
            qrcodepath_pinjam: "", qrcodepath_kontak: "",
          });
        }
      } catch (err) {
        console.error("Gagal fetch PJ Gedung:", err);
      }
    };

    if (id_gedung && id_lantai) {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [id_gedung, id_lantai]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString("en-GB", { hour12: false }).slice(0, 5);
      
      setCurrentDate(date);
      setCurrentTime(time);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unusedRuangan = data.filter(d => {
    const status = getStatusRuangan(d, currentDate, currentTime);
    return status === 'tidak_digunakan';
  });
  
  const usedRuangan = data.filter(d => {
    const status = getStatusRuangan(d, currentDate, currentTime);
    return status === 'sedang_digunakan';
  });
  
  const upcomingRuangan = data.filter(d => {
    const status = getStatusRuangan(d, currentDate, currentTime);
    return status === 'akan_digunakan';
  });

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
          <h2 className={`text-3xl font-bold px-4 py-4 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>{title}</h2>
          <div className="w-full overflow-hidden" style={{ height: `${containerHeight}px` }}>
            <div className="flex flex-col">
              {list.length > 0 ? (
                list.slice(0, maxCards).map((room) => (
                  <div key={room.id_ruangan} style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }} className="flex-shrink-0">
                    <RoomCard 
                      room={room} 
                      type={bgColor}
                      currentDate={currentDate}
                      currentTime={currentTime}
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className=" text-2xl text-gray-400 text-center">Tidak ada ruangan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-w-0">
        <h2 className={`text-2xl font-bold px-4 py-2 bg-gray-800 rounded-md ${textColor} mb-4 text-center`}>{title}</h2>
        <div className="w-full overflow-hidden relative" style={{ height: `${containerHeight}px` }}>
          <div className={`scroll-${bgColor} absolute top-0 left-0 w-full`} style={{ '--scroll-speed': `${scrollSpeed}s` }}>
            <div className="room-set">
              {list.map((room) => (
                <div key={`first-${room.id_ruangan}`} style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }} className="flex-shrink-0">
                  <RoomCard 
                    room={room} 
                    type={bgColor}
                    currentDate={currentDate}
                    currentTime={currentTime}
                  />
                </div>
              ))}
            </div>
            <div className="room-set">
              {list.map((room) => (
                <div key={`second-${room.id_ruangan}`} style={{ height: `${cardHeight}px`, minHeight: `${cardHeight}px` }} className="flex-shrink-0">
                  <RoomCard 
                    room={room} 
                    type={bgColor}
                    currentDate={currentDate}
                    currentTime={currentTime}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="bg-primary text-white"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <div 
        className="w-full h-full flex flex-col"
        style={{
          maxHeight: '100vh',
          boxSizing: 'border-box',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 p-8 bg-gray-800 rounded-lg flex-shrink-0">
          <div className="flex items-center">
            <div className="w-20 h-20 flex items-center justify-center mr-3">
              <img src="/assets/racsi_logo.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-7xl font-bold text-white">{headerData.nama_gedung}</h1>
          </div>

          <div className="text-center">
            <p className="text-5xl text-white font-bold tracking-wide mb-2 drop-shadow-lg">Lantai {headerData.nomor_lantai}</p>
            <div className="flex items-center justify-center gap-3 text-2xl text-gray-300">
              <span className="bg-gray-700 px-3 py-1 rounded-md font-medium">{headerData.pj_lantaipagi || "Tidak Ada"}</span>
              <span className="text-gray-500">|</span>
              <span className="bg-gray-700 px-3 py-1 rounded-md font-medium">{headerData.pj_lantaisiang || "Tidak Ada"}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-6xl font-bold text-white">{currentTime}</p>
            <p className="text-2xl text-gray-300">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Konten */}
        <div className="flex gap-6 w-full flex-1 min-h-0">
          <div className="flex-[1]">
            <ScrollableSection title="Tidak Digunakan" rooms={unusedRuangan} maxCards={5} bgColor="tidak_digunakan" textColor="text-green-400" scrollSpeed={45} />
          </div>
          <div className="flex-[2]">
            <ScrollableSection title="Sedang Digunakan" rooms={usedRuangan} maxCards={3} bgColor="sedang_digunakan" textColor="text-red-500" scrollSpeed={30} />
          </div>
          <div className="flex-[1]">
            <ScrollableSection title="Akan Digunakan" rooms={upcomingRuangan} maxCards={3} bgColor="akan_digunakan" textColor="text-yellow-500" scrollSpeed={30} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex-shrink-0 flex justify-center">
          <div className="p-5 bg-gray-800 rounded-lg inline-flex items-center gap-12">
            <div className="flex-shrink-0">
              <FeedbackCard 
                id_gedung={id_gedung} 
                id_lantai={id_lantai}
                key={`feedback-${id_gedung}-${id_lantai}-${Math.floor(Date.now() / 30000)}`}
              />
            </div>

            <div className="w-px h-28 bg-gray-600 flex-shrink-0"></div>

            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="w-28 h-28">
                {pjGedungData.qrcodepath_kontak ? (
                  <img 
                    className="rounded-md w-full h-full object-cover" 
                    src={pjGedungData.qrcodepath_kontak} 
                    alt="QR Kontak PJ"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      console.error('QR Kontak failed to load:', pjGedungData.qrcodepath_kontak);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('QR Kontak loaded successfully:', pjGedungData.qrcodepath_kontak);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No QR</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-3xl font-semibold text-white leading-tight mb-1">PJ Gedung</h3>
                <p className="text-xl text-gray-300 whitespace-nowrap">{pjGedungData.no_telp}</p>
                <p className="text-xl text-gray-300 whitespace-nowrap">{pjGedungData.nama}</p>
              </div>
            </div>

            <div className="w-px h-28 bg-gray-600 flex-shrink-0"></div>

            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="w-28 h-28">
                {pjGedungData.qrcodepath_pinjam ? (
                  <img 
                    className="rounded-md w-full h-full object-cover" 
                    src={pjGedungData.qrcodepath_pinjam} 
                    alt="QR Peminjaman"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      console.error('QR Peminjaman failed to load:', pjGedungData.qrcodepath_pinjam);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('QR Peminjaman loaded successfully:', pjGedungData.qrcodepath_pinjam);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No QR</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-3xl font-semibold text-white leading-tight mb-1">
                  Peminjaman<br />Ruang
                </h3>
                <p className="text-xl text-gray-300 whitespace-nowrap">
                  {pjGedungData.link_peminjaman}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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


{/*Tim Developer Sistem RACSI*/}

/* 

Fullstack Developer :
- Alif Ramadhani @al.dhani
- Husni Mubarok @hsniim / https://www.linkedin.com/in/sihusni/

UI/UX Designer :
- Ibnu Habibullah @1buunnn
- Raditya Putrantoro @bambwhoo

QA Engineer :
- Elang Nur Fadillah @el_nurfadh
- Mukafi Arzaqa @arzahere_

*/