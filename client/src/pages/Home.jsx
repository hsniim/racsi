import { useState, useEffect } from 'react';
import { ChevronDown, Building, MapPin, Eye, Monitor, Building2, Layers } from 'lucide-react';
import axios from 'axios';

function LandingPage() {
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Data states - sama seperti Dashboard.jsx
  const [gedungs, setGedungs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [filteredLantais, setFilteredLantais] = useState([]);

  // API configuration - sama seperti Dashboard.jsx
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    // Tidak menggunakan token karena ini landing page publik
  });

  // Load data dari API - adaptasi dari Dashboard.jsx
  const loadData = async () => {
    try {
      const [g, l] = await Promise.all([
        api.get("/gedung"),
        api.get("/lantai"),
      ]);
      
      setGedungs(g.data.data || []);
      setLantais(l.data.data || []);
      
      console.log("Gedungs:", g.data.data);
      console.log("Lantais:", l.data.data);
      
    } catch (error) {
      console.error("Error loading data:", error);
      setMsg({ type: "error", text: "Gagal memuat data gedung dan lantai" });
      
      // Fallback ke mock data jika API gagal
      setGedungs([
        { id_gedung: 1, nama_gedung: 'SKSG' },
        { id_gedung: 2, nama_gedung: 'FMIPA' },
        { id_gedung: 3, nama_gedung: 'FEB' },
        { id_gedung: 4, nama_gedung: 'FHISIP' },
        { id_gedung: 5, nama_gedung: 'FKIP' }
      ]);
    }
  };

  // Handle gedung change - sama seperti Dashboard.jsx
  const handleGedungChange = (e) => {
    const selectedGedungId = e.target.value;
    console.log("Selected gedung ID:", selectedGedungId);
    
    setSelectedGedung(selectedGedungId);
    setSelectedLantai(''); // Reset lantai saat gedung berubah
    
    if (selectedGedungId) {
      // Filter lantai berdasarkan gedung - sama seperti Dashboard.jsx
      const filtered = lantais.filter(l => String(l.id_gedung) === String(selectedGedungId));
      console.log("Filtered lantais:", filtered);
      setFilteredLantais(filtered);
    } else {
      setFilteredLantais([]);
    }
  };

  // Handle lantai change
  const handleLantaiChange = (e) => {
    const selectedLantaiId = e.target.value;
    setSelectedLantai(selectedLantaiId);
  };

  // Update waktu realtime
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data saat komponen mount
  useEffect(() => {
    loadData();
  }, []);

  const handleViewRooms = async () => {
    if (!selectedGedung || !selectedLantai) {
      setMsg({ type: "error", text: "Harap pilih gedung dan lantai" });
      return;
    }
    
    setIsLoading(true);
    setMsg({ type: "", text: "" });
    
    try {
      // Simulasi loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect ke halaman tampilan dengan parameter gedung & lantai
      // Sesuaikan dengan routing sistem Anda
      window.open(`/tv_device/${selectedGedung}/${selectedLantai}`, "_blank");
      
      setMsg({ type: "success", text: "Berhasil membuka tampilan ruangan" });
    } catch (error) {
      setMsg({ type: "error", text: "Gagal membuka tampilan ruangan" });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedGedung && selectedLantai;

  // Get selected gedung and lantai names untuk display
  const selectedGedungName = gedungs.find(g => g.id_gedung === parseInt(selectedGedung))?.nama_gedung || '';
  const selectedLantaiName = filteredLantais.find(l => l.id_lantai === parseInt(selectedLantai))?.nomor_lantai || '';

  return (
    <div className="h-screen bg-gray800 text-white relative overflow-hidden">
      {/* Background Pattern - sama dengan design sebelumnya */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center transform rotate-45">
              <div className="w-6 h-6 bg-gray-800 rounded-sm transform -rotate-45 flex items-center justify-center">
                <div className="w-3 h-2 bg-white rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold">RACSI</h1>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">{currentTime}</p>
            <p className="text-sm text-gray-300">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-45 shadow-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl transform -rotate-45 flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                RACSI
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Room and Control Schedule Interface
              </p>
              <p className="text-gray-400 max-w-lg mx-auto">
                Sistem informasi ketersediaan ruangan kampus untuk memudahkan monitoring dan peminjaman ruang
              </p>
            </div>

            {/* Selection Form - dengan styling seperti Dashboard.jsx */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30">
              <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-3 text-gray-300">
                <MapPin className="w-6 h-6 text-blue-400" />
                Pilih Lokasi Ruangan
              </h2>

              {/* Message Display - sama seperti Dashboard.jsx */}
              {msg.text && (
                <div className={`mb-6 p-3 rounded-xl border ${
                  msg.type === "success" 
                    ? "bg-green-600/20 border-green-400/30 text-green-200" 
                    : "bg-red-600/20 border-red-400/30 text-red-200"
                }`}>
                  {msg.text}
                </div>
              )}

              <div className="space-y-6">
                {/* Gedung Selection - sama seperti Dashboard.jsx */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Pilih Gedung *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGedung}
                      onChange={handleGedungChange}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="" className="text-gray-800">
                        -- Pilih Gedung --
                      </option>
                      {gedungs.map((gedung) => (
                        <option key={gedung.id_gedung} value={gedung.id_gedung} className="text-gray-800">
                          {gedung.nama_gedung}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Lantai Selection - sama seperti Dashboard.jsx */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Pilih Lantai *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLantai}
                      onChange={handleLantaiChange}
                      disabled={!selectedGedung}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="" className="text-gray-800">
                        -- Pilih Lantai --
                      </option>
                      {filteredLantais.map((lantai) => (
                        <option key={lantai.id_lantai} value={lantai.id_lantai} className="text-gray-800">
                          Lantai {lantai.nomor_lantai}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {/* Warning message - sama seperti Dashboard.jsx */}
                  {selectedGedung && filteredLantais.length === 0 && (
                    <p className="text-sm text-yellow-400 mt-2">
                      Tidak ada lantai tersedia untuk gedung ini
                    </p>
                  )}
                </div>

                {/* Submit Button - styling sama dengan Dashboard.jsx */}
                <button
                  onClick={handleViewRooms}
                  disabled={!isFormValid || isLoading}
                  className="w-full mt-8 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memuat Tampilan...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      Lihat Ruangan
                    </>
                  )}
                </button>
              </div>

              {/* Selected Info - dengan data real dari API */}
              {isFormValid && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-3 text-green-400">
                    <Monitor className="w-5 h-5" />
                    <span className="font-medium">
                      Akan menampilkan: {selectedGedungName} - Lantai {selectedLantaiName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-400 text-sm">
          <p>© 2025 RACSI - Room and Control Schedule Interface</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;