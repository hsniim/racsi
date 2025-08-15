function RoomCard({ room, type }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-4 text-black">
      <h3 className="text-3xl font-semibold">{room.nama_ruangan || 'Nama Tidak Ada'}</h3>
      {type === 'tidak_digunakan' && <p className="text-xl">Kapasitas: {room.kapasitas || 'Tidak Diketahui'}</p>}
      {type === 'sedang_digunakan' && (
        <>
          <p className="text-xl">Waktu: {room.waktu_mulai} - {room.waktu_selesai}</p>
          <p className="text-xl">Kapasitas: {room.kapasitas || 'Tidak Diketahui'}</p>
          <p className="text-xl">Pengguna: {room.pengguna || 'Tidak Diketahui'}</p>
        </>
      )}
      {type === 'akan_digunakan' && (
        <>
          <p className="text-xl">Kapasitas: {room.kapasitas || 'Tidak Diketahui'}</p>
          <p className="text-xl">Pengguna: {room.pengguna || 'Tidak Diketahui'}</p>
        </>
      )}
    </div>
  );
}

export default RoomCard;