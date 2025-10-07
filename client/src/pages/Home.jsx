import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Building, MapPin, Eye, Monitor, Building2, Layers, Globe, CheckCircle, Clock, Users, Shield, Zap, Calendar, BarChart, Lock } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Data states
  const [gedungs, setGedungs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [filteredLantais, setFilteredLantais] = useState([]);

  // Define features array
  const features = [
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Informasi ketersediaan ruangan diperbarui secara real-time untuk akurasi maksimal"
    },
    {
      icon: Users,
      title: "Multi-user Access",
      description: "Dapat diakses oleh seluruh civitas akademika tanpa batasan waktu"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Sistem yang aman dan dapat diandalkan dengan backup data otomatis"
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Performa cepat dengan loading time minimal untuk pengalaman pengguna optimal"
    },
    {
      icon: Calendar,
      title: "Schedule Integration",
      description: "Terintegrasi dengan sistem penjadwalan kampus untuk sinkronisasi data"
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Dashboard analitik untuk monitoring penggunaan ruangan dan statistik"
    }
  ];

  // Define benefits array
  const benefits = [
    "Meningkatkan efisiensi penggunaan ruangan kampus",
    "Mengurangi waktu pencarian ruangan kosong",
    "Memudahkan perencanaan kegiatan akademik",
    "Monitoring real-time status ketersediaan ruangan",
    "Integrasi dengan sistem penjadwalan kampus",
    "Interface yang user-friendly dan responsif",
    "Akses 24/7 dari berbagai perangkat",
    "Laporan dan analitik penggunaan ruangan"
  ];

  // API configuration dengan multiple fallback options
  const fetchFromAPI = async (endpoint) => {
    const apiUrls = [
      `http://localhost:5000/api${endpoint}`,
      `http://127.0.0.1:5000/api${endpoint}`,
      `http://localhost:3001/api${endpoint}`,
    ];

    for (let url of apiUrls) {
      try {
        console.log(`Trying to fetch from: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Success fetching from ${url}:`, data);
        return { data };
      } catch (error) {
        console.warn(`Failed to fetch from ${url}:`, error.message);
        continue;
      }
    }
    
    throw new Error('All API endpoints failed');
  };

  // Load data dengan multiple strategies
  const loadData = async () => {
    console.log("=== STARTING DATA LOAD ===");
    
    try {
      console.log("Strategy 1: Attempting to load from API...");
      
      const [gedungResponse, lantaiResponse] = await Promise.all([
        fetchFromAPI("/gedung"),
        fetchFromAPI("/lantai")
      ]);
      
      const gedungData = gedungResponse.data?.data || gedungResponse.data || [];
      const lantaiData = lantaiResponse.data?.data || lantaiResponse.data || [];
      
      if (gedungData.length > 0 && lantaiData.length > 0) {
        console.log("✅ Successfully loaded from API");
        console.log("Gedungs:", gedungData);
        console.log("Lantais:", lantaiData);
        
        setGedungs(gedungData);
        setLantais(lantaiData);
        setMsg({ type: "success", text: "Data berhasil dimuat dari database" });
        return;
      } else {
        throw new Error("Empty data from API");
      }
      
    } catch (apiError) {
      console.warn("⚠️ API failed:", apiError.message);
      console.log("Strategy 2: Using fallback data...");
      
      const fallbackGedungs = [
        { id_gedung: 1, nama_gedung: 'SKSG' },
        { id_gedung: 2, nama_gedung: 'FMIPA' },
        { id_gedung: 3, nama_gedung: 'FEB' },
        { id_gedung: 4, nama_gedung: 'FHISIP' },
        { id_gedung: 5, nama_gedung: 'FKIP' }
      ];
      
      const fallbackLantais = [
        { id_lantai: 1, id_gedung: 1, nomor_lantai: 1 },
        { id_lantai: 2, id_gedung: 1, nomor_lantai: 2 },
        { id_lantai: 3, id_gedung: 2, nomor_lantai: 1 },
        { id_lantai: 4, id_gedung: 2, nomor_lantai: 2 },
        { id_lantai: 5, id_gedung: 3, nomor_lantai: 1 },
        { id_lantai: 6, id_gedung: 3, nomor_lantai: 2 },
        { id_lantai: 7, id_gedung: 4, nomor_lantai: 1 },
        { id_lantai: 8, id_gedung: 5, nomor_lantai: 1 }
      ];
      
      setGedungs(fallbackGedungs);
      setLantais(fallbackLantais);
      setMsg({ 
        type: "warning", 
        text: "Gagal memuat dari database. Menggunakan data fallback. Periksa koneksi API Anda." 
      });
    }
  };

  // Handle gedung change
  const handleGedungChange = (e) => {
    const selectedGedungId = e.target.value;
    
    setSelectedGedung(selectedGedungId);
    setSelectedLantai('');
    setMsg({ type: "", text: "" });
    
    if (selectedGedungId && selectedGedungId !== '') {
      const gedungIdNum = parseInt(selectedGedungId);
      
      const filtered = lantais.filter(lantai => {
        const lantaiGedungId = parseInt(lantai.id_gedung);
        return lantaiGedungId === gedungIdNum;
      });
      
      setFilteredLantais(filtered);
      
      if (filtered.length === 0) {
        setMsg({ 
          type: "warning", 
          text: "Tidak ada lantai tersedia untuk gedung ini" 
        });
      }
    } else {
      setFilteredLantais([]);
    }
  };

  // Handle lantai change
  const handleLantaiChange = (e) => {
    const selectedLantaiId = e.target.value;
    setSelectedLantai(selectedLantaiId);
    setMsg({ type: "", text: "" });
  };

  // Navigation handlers
  const handleAdminLogin = () => {
    navigate('/admin/login');
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

  // Handle view rooms
  const handleViewRooms = async () => {
    if (!selectedGedung || !selectedLantai) {
      setMsg({ type: "error", text: "Harap pilih gedung dan lantai" });
      return;
    }
    
    setIsLoading(true);
    setMsg({ type: "", text: "" });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const url = `/tv_device/${selectedGedung}/${selectedLantai}`;
      window.open(url, "_blank");
      
      setMsg({ type: "success", text: "Berhasil membuka tampilan ruangan" });
    } catch (error) {
      setMsg({ type: "error", text: "Gagal membuka tampilan ruangan" });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedGedung && selectedLantai;

  const selectedGedungObj = gedungs.find(g => 
    parseInt(g.id_gedung) === parseInt(selectedGedung)
  );
  const selectedLantaiObj = filteredLantais.find(l => 
    parseInt(l.id_lantai) === parseInt(selectedLantai)
  );

  const selectedGedungName = selectedGedungObj?.nama_gedung || '';
  const selectedLantaiName = selectedLantaiObj?.nomor_lantai || '';

  return (
    <div className="w-full min-h-screen bg-primary text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
        <div className="absolute top-96 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-80 right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute top-10 left-1/2 w-28 h-28 border border-white/15 rounded-full" style={{top: '600px'}}></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 border border-white/15 rounded-full" style={{top: '800px'}}></div>
        <div className="absolute left-20 w-18 h-18 border border-white/15 rounded-full" style={{top: '1000px'}}></div>
        <div className="absolute left-10 w-24 h-24 border border-white/15 rounded-lg rotate-45" style={{top: '1200px'}}></div>
        <div className="absolute left-1/2 w-32 h-32 border border-white/15 rounded-lg rotate-12" style={{top: '1400px'}}></div>
        <div className="absolute right-40 w-22 h-22 border border-white/15 rounded-lg rotate-45" style={{top: '1600px'}}></div>
        <div className="absolute left-1/4 w-16 h-16 border border-white/20 rounded-full" style={{top: '1800px'}}></div>
        <div className="absolute right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12" style={{top: '2000px'}}></div>
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 w-full min-h-screen">
        
        {/* Header with Navigation */}
        <header className="w-full p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-30 h-30 flex items-center justify-center">
                <img src="assets/racsi_logo.svg" alt="" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">RACSI</h1>
          </div>
          
          {/* Admin Login Button */}
          <button
            onClick={handleAdminLogin}
            className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-lg rounded-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Lock className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-gray-200">Admin Login</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="w-full px-6 pt-4 pb-24 relative z-20">
          <div className="w-full max-w-5xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12 mt-4">
              <div className="w-30 h-30 flex items-center justify-center mx-auto mb-6">
                <img src="assets/racsi_logo.svg" alt="" />
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

            {/* Selection Form */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-3 text-gray-300">
                <MapPin className="w-6 h-6 text-blue-400" />
                Pilih Lokasi Ruangan
              </h2>

              {/* Message Display */}
              {msg.text && (
                <div className={`mb-6 p-3 rounded-xl border ${
                  msg.type === "success" 
                    ? "bg-green-600/20 border-green-400/30 text-green-200" 
                    : msg.type === "warning"
                    ? "bg-yellow-600/20 border-yellow-400/30 text-yellow-200"
                    : "bg-red-600/20 border-red-400/30 text-red-200"
                }`}>
                  {msg.text}
                </div>
              )}

              <div className="space-y-6">
                {/* Gedung Selection */}
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
                      <option value="">-- Pilih Gedung --</option>
                      {gedungs.map((gedung) => (
                        <option key={gedung.id_gedung} value={gedung.id_gedung}>
                          {gedung.nama_gedung}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Lantai Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Pilih Lantai *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLantai}
                      onChange={handleLantaiChange}
                      disabled={!selectedGedung || filteredLantais.length === 0}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {!selectedGedung ? "-- Pilih Gedung Dulu --" : "-- Pilih Lantai --"}
                      </option>
                      {filteredLantais.map((lantai) => (
                        <option key={lantai.id_lantai} value={lantai.id_lantai}>
                          Lantai {lantai.nomor_lantai}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
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

              {/* Selected Info */}
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

            {/* What is RACSI */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-blue-400" />
                <h3 className="text-3xl font-semibold text-gray-200">Apa itu RACSI?</h3>
              </div>
              
              <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                <p>
                  RACSI (Room and Control Schedule Interface) adalah sistem informasi digital yang dirancang khusus 
                  untuk mengelola dan menampilkan informasi ketersediaan ruangan di lingkungan kampus universitas. 
                  Sistem ini mengintegrasikan teknologi modern untuk memberikan solusi yang efisien dalam 
                  manajemen fasilitas ruangan.
                </p>
                
                <p>
                  Dengan RACSI, setiap lantai di gedung kampus dilengkapi dengan display digital yang menampilkan 
                  informasi real-time mengenai status ruangan, jadwal penggunaan, dan ketersediaan fasilitas. 
                  Hal ini memungkinkan civitas akademika untuk dengan mudah menemukan dan menggunakan ruangan 
                  yang dibutuhkan.
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-16">
              <h3 className="text-3xl font-semibold mb-8 text-center text-gray-200">Fitur Unggulan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-semibold mb-3 text-gray-200">{feature.title}</h4>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-16">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30">
                <h3 className="text-3xl font-semibold mb-8 text-center text-gray-200 flex items-center justify-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  Manfaat RACSI
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-700/30 transition-colors duration-200">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technology Section */}
            <div className="mb-16">
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-blue-500/30">
                <h3 className="text-3xl font-semibold mb-6 text-center text-gray-200">Teknologi Modern</h3>
                
                <div className="text-center text-gray-300 text-lg leading-relaxed">
                  <p className="mb-4">
                    RACSI dibangun menggunakan teknologi web modern dengan arsitektur yang scalable dan secure. 
                    Sistem ini menggunakan React.js untuk frontend yang responsif, Node.js untuk backend yang robust, 
                    dan database yang terpercaya untuk menyimpan data secara aman.
                  </p>
                  
                  <p>
                    Dengan pendekatan real-time updates dan cloud-based infrastructure, RACSI mampu memberikan 
                    performa yang optimal dan reliability yang tinggi untuk mendukung operasional kampus 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full p-6 text-center text-gray-400 text-sm relative z-20">
          <p>© 2025 RACSI - Room and Control Schedule Interface</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;