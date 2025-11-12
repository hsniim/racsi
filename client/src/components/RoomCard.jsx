import { ClipboardList } from "lucide-react";

function RoomCard({ room, type, currentDate, currentTime }) {
  if (!room) {
    return (
      <div className="w-full flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
        <div className="w-3 self-stretch bg-gray-500"></div>
        <div className="p-4 flex-1 w-full text-gray-400">
          <h3 className="text-xl font-semibold">Memuat data...</h3>
        </div>
      </div>
    );
  }

  // Cari jadwal yang sesuai dengan tanggal hari ini
  const todaySchedules = room?.jadwal_list?.filter(jadwal => 
    jadwal.tanggal === currentDate
  ) || [];

  // Fungsi untuk format waktu tanpa detik
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5); // HH:MM
  };

  // Debug logging untuk troubleshooting
  if (room.nama_ruangan && todaySchedules.length > 0) {
    console.log(`RoomCard ${room.nama_ruangan}: Found ${todaySchedules.length} schedules for ${currentDate}`, todaySchedules);
  }

  // Pilih jadwal yang relevan berdasarkan waktu saat ini
  let jadwal = null;
  if (type === "sedang_digunakan" || type === "akan_digunakan") {
    // Untuk status sedang/akan digunakan, cari jadwal yang sesuai dengan waktu
    const timeToMinutes = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutes = timeToMinutes(currentTime);
    
    if (type === "sedang_digunakan") {
      // Cari jadwal yang sedang berlangsung
      jadwal = todaySchedules.find(schedule => {
        const startMinutes = timeToMinutes(schedule.waktu_mulai);
        const endMinutes = timeToMinutes(schedule.waktu_selesai);
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      });
    } else if (type === "akan_digunakan") {
      // Cari jadwal terdekat yang akan dimulai
      const upcomingSchedules = todaySchedules.filter(schedule => {
        const startMinutes = timeToMinutes(schedule.waktu_mulai);
        return currentMinutes < startMinutes;
      }).sort((a, b) => timeToMinutes(a.waktu_mulai) - timeToMinutes(b.waktu_mulai));
      
      jadwal = upcomingSchedules.length > 0 ? upcomingSchedules[0] : null;
    }
  }

  // Warna strip berdasarkan status - UPDATED COLORS
  const statusColor =
    type === "tidak_digunakan"
      ? "bg-green-500"
      : type === "sedang_digunakan"
      ? "bg-red-500" // Changed from bg-orange-600 to approximate #AB6A20
      : "bg-yellow-500"; // Changed from bg-gray-400 to approximate #ACACAC

  return (
    <>
      {/* TIDAK DIGUNAKAN */}
      {type === "tidak_digunakan" && (
        <div className="w-full flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          {/* Strip kiri */}
          <div className={`w-3 self-stretch ${statusColor}`}></div>

          {/* Konten utama */}
          <div className="p-4 flex-1 w-full">
            <h3 className="text-4xl font-semibold text-white">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-300 mt-1">
              <img
                src="/assets/kapasitas_iconsilver.svg"
                alt="kapasitas"
                className="w-6 h-6 mr-2"
              />
              <span className="text-2xl">{room.kapasitas || "Tidak Diketahui"} Orang</span>
            </div>
          </div>
        </div>
      )}

      {/* AKAN DIGUNAKAN */}
      {type === "akan_digunakan" && jadwal && (
        <div className="w-full flex bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          <div className={`w-3 self-stretch ${statusColor}`}></div>
          <div className="p-4 flex-1 w-full text-white">
            <h3 className="text-4xl font-semibold">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-300 mt-1">
              <img src="/assets/jam_iconsilver.svg" alt="jam" className="w-6 h-6 mr-2" />
              <span className="text-2xl">
                {formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)}
              </span>
            </div>
            <div className="flex items-center text-gray-300 mt-1">
              <img src="/assets/kegiatan_iconsilver.svg" className="w-6 h-6 mr-2" alt="" />
              <span className="text-2xl">{jadwal.nama_kegiatan || "Tidak Diketahui"}</span>
            </div>
            <div className="flex items-center text-gray-300 mt-1">
              <img src="/assets/orang_iconsilver.svg" alt="pengguna" className="w-6 h-6 mr-2" />
              <span className="text-2xl">{jadwal.pengguna || "Tidak Diketahui"}</span>
            </div>
          </div>
        </div>
      )}

      {/* AKAN DIGUNAKAN - Fallback jika tidak ada jadwal */}
      {type === "akan_digunakan" && !jadwal && (
        <div className="w-full flex bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          <div className={`w-3 self-stretch ${statusColor}`}></div>
          <div className="p-4 flex-1 w-full text-white">
            <h3 className="text-4xl font-semibold">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-300 mt-1">
              <span className="text-2xl">Jadwal tidak tersedia</span>
            </div>
          </div>
        </div>
      )}

      {/* SEDANG DIGUNAKAN */}
      {type === "sedang_digunakan" && jadwal && (
        <div className="w-full flex mb-4 gap-2">
          {/* Card Kiri */}
          <div className="flex flex-1 bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className={`w-3 self-stretch ${statusColor}`}></div>
            <div className="p-4 flex-[1] text-white">
              <h3 className="text-4xl font-semibold">
                {room.nama_ruangan || "Nama Tidak Ada"}
              </h3>
              <div className="flex items-center text-gray-300 mt-1">
                <img src="/assets/jam_iconsilver.svg" alt="jam" className="w-6 h-6 mr-2" />
                <span className="text-2xl">
                  {formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)}
                </span>
              </div>
              <div className="flex items-center text-gray-300 mt-1">
                <img src="/assets/kapasitas_iconsilver.svg" alt="kapasitas" className="w-6 h-6 mr-2" />
                <span className="text-2xl">{room.kapasitas || "Tidak Diketahui"} Orang</span>
              </div>
              <div className="flex items-center text-gray-300 mt-1">
                <img src="/assets/orang_iconsilver.svg" alt="pengguna" className="w-6 h-6 mr-2" />
                <span className="text-2xl">{jadwal.pengguna || "Tidak Diketahui"}</span>
              </div>
            </div>
          </div>

          {/* Card Kanan */}
          <div className="flex-[2] bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className={`w-3 self-stretch ${statusColor}`}></div>
            <div className="p-4 flex-1 text-white">
              <h4 className="text-4xl font-semibold">
                {jadwal.nama_kegiatan || "Nama Kegiatan Tidak Ada"}
              </h4>
              <p className="text-gray-300 text-2xl mt-2">
                {jadwal.deskripsi_kegiatan || "Deskripsi tidak tersedia"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEDANG DIGUNAKAN - Fallback jika tidak ada jadwal */}
      {type === "sedang_digunakan" && !jadwal && (
        <div className="w-full flex bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          <div className={`w-3 self-stretch ${statusColor}`}></div>
          <div className="p-4 flex-1 w-full text-white">
            <h3 className="text-4xl font-semibold">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-300 mt-1">
              <span className="text-2xl">Jadwal tidak tersedia</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomCard;