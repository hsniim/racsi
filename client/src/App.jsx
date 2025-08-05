import { useEffect, useState } from 'react';
import { fetchRooms } from './utils/api';
import RoomList from './components/RoomList';
import './index.css';

function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      const data = await fetchRooms();
      setRooms(data);
    };
    loadRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-center text-black mb-6">Racsi</h1>
      <RoomList rooms={rooms} />
    </div>
  );
}

export default App;