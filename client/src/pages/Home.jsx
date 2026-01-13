import { useState, useEffect } from 'react';
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
    footer: {
      copyright: "© 2025 RACSI - Room and Control Schedule Interface"
    }
  }
};

function LandingPage() {
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [scrollY, setScrollY] = useState(0);
  const [language, setLanguage] = useState('id');

  // Data states
  const [gedungs, setGedungs] = useState([]);
  const [lantais, setLantais] = useState([]);
  const [filteredLantais, setFilteredLantais] = useState([]);

  // Get current translations
  const t = translations[language];

  // Load fallback data
  const loadData = async () => {
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
    setMsg({ type: "success", text: t.selection.successLoad });
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
    alert('Admin login clicked');
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
    <div className="w-full min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Enhanced Background with Parallax Scrolling Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-indigo-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/10 via-transparent to-blue-900/10"></div>
        
        {/* Animated Gradient Orbs - Hidden on mobile for performance */}
        <div 
          className="hidden md:block absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        ></div>
        <div 
          className="hidden md:block absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" 
          style={{
            animationDelay: '1s',
            transform: `translateY(${scrollY * -0.2}px)`
          }}
        ></div>
        <div 
          className="hidden md:block absolute top-1/2 left-1/2 w-64 md:w-96 h-64 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" 
          style={{
            animationDelay: '2s',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.4}px))`
          }}
        ></div>
        
        {/* Animated Geometric Patterns - Simplified for mobile */}
        <div className="absolute inset-0 opacity-10 md:opacity-20">
          <div 
            className="absolute top-20 left-5 md:left-10 w-16 md:w-32 h-16 md:h-32 border-2 border-blue-400/40 rounded-full animate-ping" 
            style={{
              animationDuration: '3s',
              transform: `translateY(${scrollY * 0.6}px)`
            }}
          ></div>
          <div 
            className="absolute top-40 right-10 md:right-20 w-12 md:w-24 h-12 md:h-24 border-2 border-indigo-400/40 rounded-lg rotate-45 animate-spin" 
            style={{
              animationDuration: '8s',
              transform: `translateY(${scrollY * 0.4}px) rotate(45deg)`
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
        
        {/* Header with Navigation - Responsive */}
        <header className="w-full p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">RACSI</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switch Button - Responsive */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-lg rounded-lg sm:rounded-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="font-medium text-gray-200">
                {language === 'id' ? 'EN' : 'ID'}
              </span>
            </button>

            {/* Admin Login Button - Responsive */}
            <button
              onClick={handleAdminLogin}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-lg rounded-lg sm:rounded-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="hidden sm:inline font-medium text-gray-200">{t.header.adminLogin}</span>
              <span className="sm:hidden font-medium text-gray-200">Admin</span>
            </button>
          </div>
        </header>

        {/* Main Content - Responsive */}
        <main className="w-full px-3 sm:px-4 md:px-6 pt-2 sm:pt-4 pb-12 sm:pb-16 md:pb-24 relative z-20">
          <div className="w-full max-w-5xl mx-auto">
            
            {/* Hero Section - Responsive */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12 mt-2 sm:mt-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                  <Monitor className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-400" />
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent px-4">
                {t.hero.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-1 sm:mb-2 px-4">
                {t.hero.subtitle}
              </p>
              <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto px-4">
                {t.hero.description}
              </p>
            </div>

            {/* Selection Form - Responsive */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700/30 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center flex items-center justify-center gap-2 sm:gap-3 text-gray-300">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                {t.selection.title}
              </h2>

              {/* Message Display - Responsive */}
              {msg.text && (
                <div className={`mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-sm sm:text-base ${
                  msg.type === "success" 
                    ? "bg-green-600/20 border-green-400/30 text-green-200" 
                    : msg.type === "warning"
                    ? "bg-yellow-600/20 border-yellow-400/30 text-yellow-200"
                    : "bg-red-600/20 border-red-400/30 text-red-200"
                }`}>
                  {msg.text}
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                {/* Gedung Selection - Responsive */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-gray-300 flex items-center gap-2">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t.selection.gedungLabel} *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGedung}
                      onChange={handleGedungChange}
                      className="w-full p-3 sm:p-4 bg-gray-700/50 border border-gray-600/30 rounded-lg sm:rounded-xl text-white text-sm sm:text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    >
                      <option value="">{t.selection.gedungPlaceholder}</option>
                      {gedungs.map((gedung) => (
                        <option key={gedung.id_gedung} value={gedung.id_gedung}>
                          {gedung.nama_gedung}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Lantai Selection - Responsive */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-gray-300 flex items-center gap-2">
                    <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t.selection.lantaiLabel} *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLantai}
                      onChange={handleLantaiChange}
                      disabled={!selectedGedung || filteredLantais.length === 0}
                      className="w-full p-3 sm:p-4 bg-gray-700/50 border border-gray-600/30 rounded-lg sm:rounded-xl text-white text-sm sm:text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button - Responsive */}
                <button
                  onClick={handleViewRooms}
                  disabled={!isFormValid || isLoading}
                  className="w-full mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg sm:rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none flex items-center justify-center gap-2 sm:gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t.selection.buttonLoading}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t.selection.buttonView}
                    </>
                  )}
                </button>
              </div>

              {/* Selected Info - Responsive */}
              {isFormValid && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3 text-green-400 text-sm sm:text-base">
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {t.selection.selectedInfo} {selectedGedungName} - {t.selection.lantaiPrefix} {selectedLantaiName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer - Responsive */}
        <footer className="w-full p-4 sm:p-6 text-center text-gray-400 text-xs sm:text-sm relative z-20">
          <p>{t.footer.copyright}</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;