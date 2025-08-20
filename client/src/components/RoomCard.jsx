function RoomCard({ room, type }) {
  const jadwal =
    room.jadwal_list && room.jadwal_list.length > 0
      ? room.jadwal_list[0]
      : null;

  // Warna strip berdasarkan status
  const statusColor =
    type === "tidak_digunakan"
      ? "bg-green-500"
      : type === "sedang_digunakan"
      ? "bg-red-500"
      : "bg-yellow-500";

  // Fungsi untuk format waktu tanpa detik
  const formatTime = (timeString) => {
    if (!timeString) return timeString;
    return timeString.slice(0, 5); // HH:MM
  };

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
            <div className="flex items-center text-gray-400 mt-2">
              <img
                src="/assets/kapasitas_iconsilver.svg"
                alt="kapasitas"
                className="w-5 h-5 mr-2"
              />
              <span className="text-xl">{room.kapasitas || "Tidak Diketahui"} Orang</span>
            </div>
          </div>
        </div>
      )}

      {/* AKAN DIGUNAKAN */}
      {type === "akan_digunakan" && jadwal && (
        <div className="w-full flex bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          {/* Strip kiri */}
          <div className={`w-3 self-stretch ${statusColor}`}></div>

          {/* Konten utama */}
          <div className="p-4 flex-1 w-full text-white">
            <h3 className="text-4xl font-semibold">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/jam_iconsilver.svg" alt="jam" className="w-5 h-5 mr-2" />
              <span className="text-xl">
                {formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)}
              </span>
            </div>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/kapasitas_iconsilver.svg" alt="kapasitas" className="w-5 h-5 mr-2" />
              <span className="text-xl">{room.kapasitas || "Tidak Diketahui"} Orang</span>
            </div>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/orang_iconsilver.svg" alt="pengguna" className="w-5 h-5 mr-2" />
              <span className="text-xl">{jadwal.pengguna || "Tidak Diketahui"}</span>
            </div>
          </div>
        </div>
      )}

      {/* SEDANG DIGUNAKAN - Horizontal Split Card */}
      {type === "sedang_digunakan" && jadwal && (
        <div className="w-full flex mb-4 gap-2">
          {/* Card Bagian Kiri - Info Ruangan */}
          <div className="flex flex-1 bg-gray-800 rounded-lg overflow-hidden shadow-md">
            {/* Strip kiri */}
            <div className={`w-3 self-stretch ${statusColor}`}></div>
            
            <div className="p-4 flex-[1] text-white">
              <h3 className="text-4xl font-semibold">
                {room.nama_ruangan || "Nama Tidak Ada"}
              </h3>

              <div className="flex items-center text-gray-300 mt-2">
                <img src="/assets/jam_iconsilver.svg" alt="jam" className="w-5 h-5 mr-2" />
                <span className="text-xl">
                  {formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)}
                </span>
              </div>
              <div className="flex items-center text-gray-300 mt-2">
                <img src="/assets/kapasitas_iconsilver.svg" alt="kapasitas" className="w-5 h-5 mr-2" />
                <span className="text-xl">{room.kapasitas || "Tidak Diketahui"} Orang</span>
              </div>
              <div className="flex items-center text-gray-300 mt-2">
                <img src="/assets/orang_iconsilver.svg" alt="pengguna" className="w-5 h-5 mr-2" />
                <span className="text-xl">{jadwal.pengguna || "Tidak Diketahui"}</span>
              </div>
            </div>
          </div>

          {/* Card Bagian Kanan - Info Kegiatan */}
          <div className="flex-[2] bg-gray-800 rounded-lg overflow-hidden shadow-md">
            {/* Strip kiri untuk bagian kanan juga */}
            <div className={`w-3 self-stretch ${statusColor}`}></div>
            
            <div className="p-4 flex-1 text-white">
              <h4 className="text-3xl font-semibold">
                {jadwal.nama_kegiatan || "Nama Kegiatan Tidak Ada"}
              </h4>
              <p className="text-gray-300 text-md mt-2">
                {jadwal.deskripsi_kegiatan || "Deskripsi tidak tersedia"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomCard;