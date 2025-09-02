import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TvPage() {
  const { id_device } = useParams();
  const [ruangan, setRuangan] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`/api/tv-device/${id_device}/data`);
      setRuangan(res.data);
    };

    fetchData();

    // Auto-refresh tiap 30 detik
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id_device]);

  return (
    <div>
      <h1>Tampilan TV Device {id_device}</h1>
      {ruangan.map(r => (
        <div key={r.id_ruangan}>
          <h3>{r.nama_ruangan} (Kapasitas {r.kapasitas})</h3>
          {r.status ? (
            <p style={{color:"red"}}>Sedang digunakan</p>
          ) : (
            <p style={{color:"green"}}>Tidak digunakan</p>
          )}
        </div>
      ))}
    </div>
  );
}