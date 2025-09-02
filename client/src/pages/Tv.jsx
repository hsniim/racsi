import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Tv() {
  const { id_device } = useParams();
  const [config, setConfig] = useState(null);
  const [ruangan, setRuangan] = useState([]);

  const fetchAll = async () => {
    const conf = await axios.get(`http://localhost:5000/api/tv-device/${id_device}/config`);
    setConfig(conf.data.data);
    const data = await axios.get(`http://localhost:5000/api/tv-device/${id_device}/data`);
    setRuangan(data.data.data || []);
  };

  useEffect(() => {
    fetchAll();
    const it = setInterval(fetchAll, 30000); // refresh 30 dtk
    return () => clearInterval(it);
  }, [id_device]);

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{config ? `${config.nama_gedung} • ${config.nama_lantai}` : "…"}</h1>
        <div className="text-sm opacity-70">Device #{id_device}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {ruangan.map(r => (
          <div key={r.id_ruangan} className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/40">
            <div className="text-lg font-semibold">{r.nama_ruangan}</div>
            <div className="text-sm opacity-80">Kapasitas {r.kapasitas} orang</div>
            <div className={`mt-2 text-sm font-semibold ${r.status_now ? "text-red-400" : "text-green-400"}`}>
              {r.status_now ? "Sedang digunakan" : "Tidak digunakan"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
