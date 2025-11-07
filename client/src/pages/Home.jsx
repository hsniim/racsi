import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Building, MapPin, Eye, Monitor, Building2, Layers, Globe, CheckCircle, Clock, Users, Shield, Zap, Calendar, BarChart, Lock, Languages } from 'lucide-react';

// Translations object
const translations = {
  id: {
    header: {
      adminLogin: "Admin Login"
    },
    hero: {
      title: "RACSI",
      subtitle: "Room and Control Schedule Interface",
      description: "Sistem informasi ketersediaan ruangan kampus untuk memudahkan monitoring dan peminjaman ruang"
    },
    selection: {
      title: "Pilih Lokasi Ruangan",
      gedungLabel: "Pilih Gedung",
      gedungPlaceholder: "-- Pilih Gedung --",
      lantaiLabel: "Pilih Lantai",
      lantaiPlaceholder: "-- Pilih Lantai --",
      lantaiDisabled: "-- Pilih Gedung Dulu --",
      buttonView: "Lihat Informasi Ruangan",
      buttonLoading: "Memuat Tampilan...",
      selectedInfo: "Akan menampilkan:",
      lantaiPrefix: "Lantai",
      errorSelectBoth: "Harap pilih gedung dan lantai",
      successOpen: "Berhasil membuka tampilan ruangan",
      errorOpen: "Gagal membuka tampilan ruangan",
      successLoad: "Data berhasil dimuat dari database",
      warningFallback: "Gagal memuat dari database. Menggunakan data fallback. Periksa koneksi API Anda.",
      warningNoFloor: "Tidak ada lantai tersedia untuk gedung ini"
    },
    about: {
      title: "Apa itu RACSI?",
      paragraph1: "RACSI (Room and Control Schedule Interface) adalah sistem informasi digital yang dirancang khusus untuk mengelola dan menampilkan informasi ketersediaan ruangan di lingkungan kampus universitas. Sistem ini mengintegrasikan teknologi modern untuk memberikan solusi yang efisien dalam manajemen fasilitas ruangan.",
      paragraph2: "Dengan RACSI, setiap lantai di gedung kampus dilengkapi dengan display digital yang menampilkan informasi real-time mengenai status ruangan, jadwal penggunaan, dan ketersediaan fasilitas. Hal ini memungkinkan civitas akademika untuk dengan mudah menemukan dan menggunakan ruangan yang dibutuhkan."
    },
    features: {
      title: "Fitur Unggulan",
      items: [
        {
          title: "Real-time Updates",
          description: "Informasi ketersediaan ruangan diperbarui secara real-time untuk akurasi maksimal"
        },
        {
          title: "Multi-user Access",
          description: "Dapat diakses oleh seluruh civitas akademika tanpa batasan waktu"
        },
        {
          title: "Secure & Reliable",
          description: "Sistem yang aman dan dapat diandalkan dengan backup data otomatis"
        },
        {
          title: "Fast Performance",
          description: "Performa cepat dengan loading time minimal untuk pengalaman pengguna optimal"
        },
        {
          title: "Schedule Integration",
          description: "Terintegrasi dengan sistem penjadwalan kampus untuk sinkronisasi data"
        },
        {
          title: "Analytics Dashboard",
          description: "Dashboard analitik untuk monitoring penggunaan ruangan dan statistik"
        }
      ]
    },
    benefits: {
      title: "Manfaat RACSI",
      items: [
        "Meningkatkan efisiensi penggunaan ruangan kampus",
        "Mengurangi waktu pencarian ruangan kosong",
        "Memudahkan perencanaan kegiatan akademik",
        "Monitoring real-time status ketersediaan ruangan",
        "Integrasi dengan sistem penjadwalan kampus",
        "Interface yang user-friendly dan responsif",
        "Akses 24/7 dari berbagai perangkat",
        "Laporan dan analitik penggunaan ruangan"
      ]
    },
    technology: {
      title: "Teknologi Modern",
      paragraph1: "RACSI dibangun menggunakan teknologi web modern dengan arsitektur yang scalable dan secure. Sistem ini menggunakan React.js untuk frontend yang responsif, Node.js untuk backend yang robust, dan database yang terpercaya untuk menyimpan data secara aman.",
      paragraph2: "Dengan pendekatan real-time updates dan cloud-based infrastructure, RACSI mampu memberikan performa yang optimal dan reliability yang tinggi untuk mendukung operasional kampus 24/7."
    },
    footer: {
      copyright: "© 2025 RACSI - Room and Control Schedule Interface"
    }
  },
  en: {
    header: {
      adminLogin: "Admin Login"
    },
    hero: {
      title: "RACSI",
      subtitle: "Room and Control Schedule Interface",
      description: "Campus room availability information system to facilitate monitoring and room booking"
    },
    selection: {
      title: "Select Room Location",
      gedungLabel: "Select Building",
      gedungPlaceholder: "-- Select Building --",
      lantaiLabel: "Select Floor",
      lantaiPlaceholder: "-- Select Floor --",
      lantaiDisabled: "-- Select Building First --",
      buttonView: "View Room Information",
      buttonLoading: "Loading Display...",
      selectedInfo: "Will display:",
      lantaiPrefix: "Floor",
      errorSelectBoth: "Please select building and floor",
      successOpen: "Successfully opened room display",
      errorOpen: "Failed to open room display",
      successLoad: "Data successfully loaded from database",
      warningFallback: "Failed to load from database. Using fallback data. Please check your API connection.",
      warningNoFloor: "No floors available for this building"
    },
    about: {
      title: "What is RACSI?",
      paragraph1: "RACSI (Room and Control Schedule Interface) is a digital information system specifically designed to manage and display room availability information in the university campus environment. This system integrates modern technology to provide efficient solutions in room facility management.",
      paragraph2: "With RACSI, each floor in campus buildings is equipped with digital displays that show real-time information about room status, usage schedules, and facility availability. This allows the academic community to easily find and use the rooms they need."
    },
    features: {
      title: "Key Features",
      items: [
        {
          title: "Real-time Updates",
          description: "Room availability information is updated in real-time for maximum accuracy"
        },
        {
          title: "Multi-user Access",
          description: "Accessible by all academic community members without time restrictions"
        },
        {
          title: "Secure & Reliable",
          description: "Secure and reliable system with automatic data backup"
        },
        {
          title: "Fast Performance",
          description: "Fast performance with minimal loading time for optimal user experience"
        },
        {
          title: "Schedule Integration",
          description: "Integrated with campus scheduling system for data synchronization"
        },
        {
          title: "Analytics Dashboard",
          description: "Analytics dashboard for monitoring room usage and statistics"
        }
      ]
    },
    benefits: {
      title: "RACSI Benefits",
      items: [
        "Improve campus room usage efficiency",
        "Reduce time searching for empty rooms",
        "Facilitate academic activity planning",
        "Real-time monitoring of room availability status",
        "Integration with campus scheduling system",
        "User-friendly and responsive interface",
        "24/7 access from various devices",
        "Room usage reports and analytics"
      ]
    },
    technology: {
      title: "Modern Technology",
      paragraph1: "RACSI is built using modern web technology with scalable and secure architecture. This system uses React.js for responsive frontend, Node.js for robust backend, and reliable database to store data securely.",
      paragraph2: "With real-time updates approach and cloud-based infrastructure, RACSI is able to deliver optimal performance and high reliability to support 24/7 campus operations."
    },
    footer: {
      copyright: "© 2025 RACSI - Room and Control Schedule Interface"
    }
  }
};

function LandingPage() {
  const navigate = useNavigate();
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [scrollY, setScrollY] = useState(0);
  const [language, setLanguage] = useState('id'); // Language state

  // Data states
  const [gedungs, setGedungs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [filteredLantais, setFilteredLantais] = useState([]);

  // Get current translations
  const t = translations[language];

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
        setMsg({ type: "success", text: t.selection.successLoad });
        return;
      } else {
        throw new Error("Empty data from API");
      }
      
    } catch (apiError) {
      console.warn("⚠️ API failed:", apiError.message);
      console.log("Strategy 2: Using fallback data...");
      
      const fallbackGedungs = [
        { id_gedung: 1, nama_gedung: 'SKSG' },
        { id_gedung: 2, nama_gedung: 'SIL' },
        { id_gedung: 3, nama_gedung: 'FEB' },
        { id_gedung: 4, nama_gedung: 'FK' },
        { id_gedung: 5, nama_gedung: 'FKG' }
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
        text: t.selection.warningFallback
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
          text: t.selection.warningNoFloor
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
    navigate('/admin');
  };

  // Handle language toggle
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Reload messages when language changes
  useEffect(() => {
    if (msg.type === "success") {
      setMsg({ type: "success", text: t.selection.successLoad });
    } else if (msg.type === "warning" && msg.text.includes("fallback")) {
      setMsg({ type: "warning", text: t.selection.warningFallback });
    } else if (msg.type === "warning" && msg.text.includes("lantai")) {
      setMsg({ type: "warning", text: t.selection.warningNoFloor });
    }
  }, [language]);

  // Handle view rooms
  const handleViewRooms = async () => {
    if (!selectedGedung || !selectedLantai) {
      setMsg({ type: "error", text: t.selection.errorSelectBoth });
      return;
    }
    
    setIsLoading(true);
    setMsg({ type: "", text: "" });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const url = `/tv_device/${selectedGedung}/${selectedLantai}`;
      window.open(url, "_blank");
      
      setMsg({ type: "success", text: t.selection.successOpen });
    } catch (error) {
      setMsg({ type: "error", text: t.selection.errorOpen });
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
      {/* Enhanced Background with Parallax Scrolling Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-primary to-indigo-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/10 via-transparent to-blue-900/10"></div>
        
        {/* Animated Gradient Orbs */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" 
          style={{
            animationDelay: '1s',
            transform: `translateY(${scrollY * -0.2}px)`
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" 
          style={{
            animationDelay: '2s',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.4}px))`
          }}
        ></div>
        
        {/* Animated Geometric Patterns with Parallax */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-400/40 rounded-full animate-ping" 
            style={{
              animationDuration: '3s',
              transform: `translateY(${scrollY * 0.6}px)`
            }}
          ></div>
          <div 
            className="absolute top-40 right-20 w-24 h-24 border-2 border-indigo-400/40 rounded-lg rotate-45 animate-spin" 
            style={{
              animationDuration: '8s',
              transform: `translateY(${scrollY * 0.4}px) rotate(45deg)`
            }}
          ></div>
          <div 
            className="absolute top-96 left-1/4 w-16 h-16 border-2 border-purple-400/40 rounded-full animate-bounce" 
            style={{
              animationDuration: '4s',
              transform: `translateY(${scrollY * 0.7}px)`
            }}
          ></div>
          <div 
            className="absolute top-80 right-1/3 w-20 h-20 border-2 border-blue-400/40 rounded-lg rotate-12 animate-pulse"
            style={{
              transform: `translateY(${scrollY * 0.5}px) rotate(12deg)`
            }}
          ></div>
          <div 
            className="absolute left-1/2 w-28 h-28 border-2 border-indigo-400/30 rounded-full animate-ping" 
            style={{
              top: '600px', 
              animationDuration: '4s',
              transform: `translateY(${scrollY * 0.3}px)`
            }}
          ></div>
          <div 
            className="absolute right-10 w-20 h-20 border-2 border-purple-400/30 rounded-full animate-bounce" 
            style={{
              top: '800px', 
              animationDuration: '3s',
              transform: `translateY(${scrollY * 0.6}px)`
            }}
          ></div>
          <div 
            className="absolute left-20 w-18 h-18 border-2 border-blue-400/30 rounded-full animate-pulse" 
            style={{
              top: '1000px',
              transform: `translateY(${scrollY * 0.4}px)`
            }}
          ></div>
          <div 
            className="absolute left-10 w-24 h-24 border-2 border-indigo-400/30 rounded-lg rotate-45 animate-spin" 
            style={{
              top: '1200px', 
              animationDuration: '10s',
              transform: `translateY(${scrollY * 0.5}px) rotate(45deg)`
            }}
          ></div>
          <div 
            className="absolute left-1/2 w-32 h-32 border-2 border-purple-400/30 rounded-lg rotate-12 animate-ping" 
            style={{
              top: '1400px', 
              animationDuration: '5s',
              transform: `translateY(${scrollY * 0.35}px) rotate(12deg)`
            }}
          ></div>
          <div 
            className="absolute right-40 w-22 h-22 border-2 border-blue-400/30 rounded-lg rotate-45 animate-pulse" 
            style={{
              top: '1600px',
              transform: `translateY(${scrollY * 0.45}px) rotate(45deg)`
            }}
          ></div>
          <div 
            className="absolute left-1/4 w-16 h-16 border-2 border-indigo-400/40 rounded-full animate-bounce" 
            style={{
              top: '1800px', 
              animationDuration: '3.5s',
              transform: `translateY(${scrollY * 0.55}px)`
            }}
          ></div>
          <div 
            className="absolute right-1/3 w-20 h-20 border-2 border-purple-400/40 rounded-lg rotate-12 animate-spin" 
            style={{
              top: '2000px', 
              animationDuration: '7s',
              transform: `translateY(${scrollY * 0.65}px) rotate(12deg)`
            }}
          ></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        ></div>
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
          
          <div className="flex items-center gap-3">
            {/* Language Switch Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-lg rounded-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Languages className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-200">
                {language === 'id' ? 'EN' : 'ID'}
              </span>
            </button>

            {/* Admin Login Button */}
            <button
              onClick={handleAdminLogin}
              className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-lg rounded-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-200">{t.header.adminLogin}</span>
            </button>
          </div>
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
                {t.hero.title}
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                {t.hero.subtitle}
              </p>
              <p className="text-gray-400 max-w-lg mx-auto">
                {t.hero.description}
              </p>
            </div>

            {/* Selection Form */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-3 text-gray-300">
                <MapPin className="w-6 h-6 text-blue-400" />
                {t.selection.title}
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
                    {t.selection.gedungLabel} *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGedung}
                      onChange={handleGedungChange}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="">{t.selection.gedungPlaceholder}</option>
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
                    {t.selection.lantaiLabel} *
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
                        {!selectedGedung ? t.selection.lantaiDisabled : t.selection.lantaiPlaceholder}
                      </option>
                      {filteredLantais.map((lantai) => (
                        <option key={lantai.id_lantai} value={lantai.id_lantai}>
                          {t.selection.lantaiPrefix} {lantai.nomor_lantai}
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
                      {t.selection.buttonLoading}
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      {t.selection.buttonView}
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
                      {t.selection.selectedInfo} {selectedGedungName} - {t.selection.lantaiPrefix} {selectedLantaiName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* What is RACSI */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-blue-400" />
                <h3 className="text-3xl font-semibold text-gray-200">{t.about.title}</h3>
              </div>
              
              <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                <p>
                  {t.about.paragraph1}
                </p>
                
                <p>
                  {t.about.paragraph2}
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-16">
              <h3 className="text-3xl font-semibold mb-8 text-center text-gray-200">{t.features.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.features.items.map((feature, index) => {
                  const icons = [Clock, Users, Shield, Zap, Calendar, BarChart];
                  const IconComponent = icons[index];
                  return (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-300 hover:transform hover:-translate-y-1">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-blue-400" />
                      </div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-200">{feature.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-16">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30">
                <h3 className="text-3xl font-semibold mb-8 text-center text-gray-200 flex items-center justify-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  {t.benefits.title}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {t.benefits.items.map((benefit, index) => (
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
                <h3 className="text-3xl font-semibold mb-6 text-center text-gray-200">{t.technology.title}</h3>
                
                <div className="text-center text-gray-300 text-lg leading-relaxed">
                  <p className="mb-4">
                    {t.technology.paragraph1}
                  </p>
                  
                  <p>
                    {t.technology.paragraph2}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full p-6 text-center text-gray-400 text-sm relative z-20">
          <p>{t.footer.copyright}</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;


{/*Tim Developer Sistem RACSI*/}

/* 

Fullstack Developer :
- Alif Ramadhani @al.dhani
- Husni Mubarok @hsniim / https://www.linkedin.com/in/sihusni/

UI/UX Designer :
- Ibnu Habibullah @1buunnn
- Raditya Putrantoro @bambwhoo

QA Engineer :
- Elang Nur Fadillah @el_nurfadh
- Mukafi Arzaqa @arzahere_

*/