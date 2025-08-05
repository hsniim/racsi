const RoomList = ({ rooms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room) => (
        <div key={room.id} className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-2xl text-black font-semibold">{room.name}</h2>
          <p className="text-lg text-black">Kapasitas : {room.capacity}</p>
          <p className="text-lg text-black">Status: {room.status}</p>
        </div>
      ))}
    </div>
  );
};

export default RoomList;