function RoomCard({ room, jadwal }) {
  return (
    <div className="p-4 bg-cardcolor rounded-lg shadow-md mb-4">
      <h3 className="text-3xl font-semibold">{room?.nama_ruangan || 'Nama Tidak Ada'}</h3>
      <p className="text-xl">Kapasitas: {room?.kapasitas || 'Tidak Diketahui'}</p>
      <p className="text-xl">Status: {room?.status || 'Tidak Diketahui'}</p>
      {jadwal && <p className="text-xl">Jadwal: {jadwal}</p>}
    </div>
  );
}

export default RoomCard;