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

  return (
    <>
      {/* TIDAK DIGUNAKAN */}
      {type === "tidak_digunakan" && (
        <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          {/* Strip kiri */}
          <div className={`w-2 ${statusColor}`}></div>

          {/* Konten utama */}
          <div className="p-4 flex-1">
            <h3 className="text-2xl font-semibold text-white">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-400 mt-2">
              <img
                src="/assets/kapasitas_iconsilver.svg"
                alt="kapasitas"
                className="w-4 h-4 mr-2"
              />
              <span>{room.kapasitas || "Tidak Diketahui"} Orang</span>
            </div>
          </div>
        </div>
      )}

      {/* AKAN DIGUNAKAN */}
      {type === "akan_digunakan" && jadwal && (
        <div className="flex bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          {/* Strip kiri */}
          <div className={`w-2 ${statusColor}`}></div>

          {/* Konten utama */}
          <div className="p-4 flex-1 text-white">
            <h3 className="text-2xl font-semibold">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/jam_iconsilver.svg" alt="jam" className="w-4 h-4 mr-2" />
              <span>
                {jadwal.waktu_mulai} - {jadwal.waktu_selesai}
              </span>
            </div>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/kapasitas_iconsilver.svg" alt="kapasitas" className="w-4 h-4 mr-2" />
              <span>{room.kapasitas || "Tidak Diketahui"} Orang</span>
            </div>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/orang_iconsilver.svg" alt="pengguna" className="w-4 h-4 mr-2" />
              <span>{jadwal.pengguna || "Tidak Diketahui"}</span>
            </div>
          </div>
        </div>
      )}

      {/* SEDANG DIGUNAKAN */}
      {type === "sedang_digunakan" && jadwal && (
        <div className="flex bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
          {/* Strip kiri */}
          <div className={`w-2 ${statusColor}`}></div>

          {/* Konten utama */}
          <div className="p-4 flex-1 text-white">
            <h3 className="text-2xl font-semibold">
              {room.nama_ruangan || "Nama Tidak Ada"}
            </h3>

            {/* Nama & deskripsi kegiatan dari DB */}
            <div className="mt-2">
              <h4 className="text-lg font-bold">
                {jadwal.nama_kegiatan || "Nama Kegiatan Tidak Ada"}
              </h4>
              <p className="text-gray-300 text-sm">
                {jadwal.deskripsi_kegiatan || "Deskripsi tidak tersedia"}
              </p>
            </div>

            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/jam_iconsilver.svg" alt="jam" className="w-4 h-4 mr-2" />
              <span>
                {jadwal.waktu_mulai} - {jadwal.waktu_selesai}
              </span>
            </div>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/kapasitas_iconsilver.svg" alt="kapasitas" className="w-4 h-4 mr-2" />
              <span>{room.kapasitas || "Tidak Diketahui"} Orang</span>
            </div>
            <div className="flex items-center text-gray-300 mt-2">
              <img src="/assets/orang_iconsilver.svg" alt="pengguna" className="w-4 h-4 mr-2" />
              <span>{jadwal.pengguna || "Tidak Diketahui"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomCard;
