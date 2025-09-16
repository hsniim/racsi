import { useState, useEffect } from 'react';
import { Building, Users, Heart, Target, Mail, Phone, MapPin, Award, Code, Lightbulb, GraduationCap, BookOpen, Star, Zap, Calendar, Building2, ChevronDown } from 'lucide-react';

function About() {
  const [currentTime, setCurrentTime] = useState('');

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

  // Navigation handler - sama seperti di Home.jsx
  const handleNavigation = (page) => {
    if (page === 'home') {
      window.location.href = '/'; // atau sesuaikan dengan path routing Anda
    }
  };

  const teamMembers = [
    {
      name: "Ahmad Rizki Pratama",
      role: "Project Leader & Full Stack Developer",
      school: "SMK Negeri 1 Teknologi Informasi",
      description: "Siswa jurusan Rekayasa Perangkat Lunak yang memimpin tim dalam pengembangan sistem RACSI. Bertanggung jawab atas arsitektur sistem dan koordinasi tim.",
      icon: Target
    },
    {
      name: "Siti Nurhaliza",
      role: "Frontend Developer & UI/UX Designer",
      school: "SMK Negeri 1 Teknologi Informasi",
      description: "Siswa jurusan Multimedia yang fokus pada pengembangan antarmuka pengguna yang menarik dan user-friendly untuk sistem RACSI.",
      icon: Code
    },
    {
      name: "Budi Setiawan",
      role: "Backend Developer & Database Administrator",
      school: "SMK Negeri 1 Teknologi Informasi",
      description: "Siswa jurusan Teknik Komputer dan Jaringan yang mengelola server, database, dan API untuk memastikan performa sistem yang optimal.",
      icon: Award
    },
    {
      name: "Rina Kusuma Dewi",
      role: "System Analyst & Quality Assurance",
      school: "SMK Negeri 1 Teknologi Informasi",
      description: "Siswa jurusan Rekayasa Perangkat Lunak yang bertanggung jawab dalam analisis kebutuhan sistem dan pengujian kualitas aplikasi.",
      icon: Lightbulb
    }
  ];

  const values = [
    {
      icon: GraduationCap,
      title: "Pembelajaran",
      description: "Mengaplikasikan ilmu yang dipelajari di SMK untuk menciptakan solusi teknologi yang bermanfaat"
    },
    {
      icon: Heart,
      title: "Dedikasi",
      description: "Berkomitmen memberikan yang terbaik dalam proyek PKL untuk kemajuan dunia pendidikan"
    },
    {
      icon: Users,
      title: "Kerjasama Tim",
      description: "Bekerja sama dengan solid sebagai satu tim SMK untuk mencapai tujuan bersama"
    },
    {
      icon: Star,
      title: "Inovasi Muda",
      description: "Menghadirkan perspektif fresh dari generasi muda dalam pengembangan teknologi"
    }
  ];

  const achievements = [
    "Berhasil menyelesaikan proyek PKL selama 6 bulan",
    "Mengimplementasikan sistem real-time untuk 5+ gedung kampus",
    "Melayani 1000+ pengguna dalam tahap uji coba",
    "Mendapat apresiasi dari pembimbing PKL dan pihak universitas",
    "Menguasai teknologi web modern (React.js, Node.js, MySQL)",
    "Mengembangkan soft skills dalam manajemen proyek dan presentasi"
  ];

  const learningOutcomes = [
    {
      icon: Code,
      title: "Pengembangan Web",
      description: "Menguasai teknologi modern seperti React.js, Node.js, dan database management"
    },
    {
      icon: Users,
      title: "Kerjasama Tim",
      description: "Belajar bekerja dalam tim, komunikasi efektif, dan manajemen proyek"
    },
    {
      icon: Lightbulb,
      title: "Problem Solving",
      description: "Menganalisis kebutuhan pengguna dan mencari solusi teknologi yang tepat"
    },
    {
      icon: Building,
      title: "Pengalaman Industri",
      description: "Memahami dunia kerja dan tantangan dalam pengembangan sistem informasi"
    }
  ];

  return (
    <div className="h-screen bg-primary text-white relative overflow-x-hidden">
      {/* Background Pattern - diperbaiki */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute top-96 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-80 right-1/3 w-20 h-20 border border-white/20 rounded-lg rotate-12"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Navigation */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-30 h-30 flex items-center justify-center">
                <img src="assets/racsi_logo.svg" alt="" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">RACSI</h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-8">
            <button onClick={() => handleNavigation('home')} className="text-gray-300 text-xl hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer">
              Beranda
            </button>
            <span className="text-white text-xl font-medium border-b-2 border-blue-400 pb-1 transition-colors">
              Tentang Kami
            </span>
          </nav>
          
          <div className="text-right">
            <p className="text-3xl font-bold">{currentTime}</p>
            <p className="text-md text-gray-300">
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
        <main className="container mx-auto px-4 py-8">
          <div className="w-full max-w-7xl mx-auto space-y-8 sm:space-y-12">

            {/* Hero Section */}
            <section className="text-center space-y-4 sm:space-y-6 py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white font-bold text-2xl sm:text-3xl">R</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Tentang Tim RACSI
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-2">
                Siswa SMK yang Berdedikasi untuk Inovasi Teknologi Pendidikan
              </p>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4">
                Kami adalah tim siswa SMK yang mengembangkan RACSI sebagai proyek PKL (Praktik Kerja Lapangan) untuk memberikan solusi teknologi di dunia pendidikan
              </p>
            </section>

            {/* About Project Section */}
            <section className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-700/30">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-200">Tentang Proyek PKL Kami</h2>
              </div>
              
              <div className="text-gray-300 text-base sm:text-lg leading-relaxed space-y-4">
                <p>
                  RACSI (Room and Control Schedule Interface) adalah proyek PKL yang kami kembangkan sebagai tim siswa SMK Negeri 1 Teknologi Informasi. 
                  Proyek ini merupakan aplikasi dari ilmu yang telah kami pelajari selama di SMK, khususnya dalam bidang pemrograman web dan manajemen database.
                </p>
                
                <p>
                  Melalui proyek ini, kami belajar langsung bagaimana mengembangkan sistem informasi yang kompleks, mulai dari analisis kebutuhan, 
                  perancangan sistem, implementasi, hingga testing. Pengalaman ini memberikan kami pemahaman mendalam tentang dunia kerja 
                  di bidang teknologi informasi.
                </p>
                
                <p>
                  Selama 6 bulan masa PKL, kami berhasil menciptakan sistem yang tidak hanya memenuhi kebutuhan teknis, tetapi juga dapat 
                  memberikan manfaat nyata bagi pengguna di lingkungan kampus universitas.
                </p>
              </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Mission */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-gray-700/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400 flex-shrink-0" />
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-200">Misi Kami</h2>
                </div>
                
                <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                  Sebagai siswa SMK, kami bertekad untuk menerapkan ilmu yang telah dipelajari dalam bentuk solusi teknologi 
                  yang bermanfaat bagi masyarakat, khususnya di bidang pendidikan. Kami ingin membuktikan bahwa generasi muda 
                  mampu berkontribusi positif melalui inovasi teknologi.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-gray-700/30">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400 flex-shrink-0" />
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-200">Visi Kami</h2>
                </div>
                
                <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                  Menjadi contoh bagaimana siswa SMK dapat menghasilkan karya teknologi yang berkualitas dan berdampak positif. 
                  Kami berharap proyek ini dapat menginspirasi siswa SMK lainnya untuk terus berinovasi dan berkontribusi 
                  dalam kemajuan teknologi Indonesia.
                </p>
              </div>
            </section>

            {/* Values Section */}
            <section>
              <h2 className="text-2xl lg:text-3xl font-semibold mb-8 text-center text-gray-200">Nilai-Nilai Tim Kami</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {values.map((value, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-300 hover:transform hover:-translate-y-1 text-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 lg:mb-4 mx-auto">
                      <value.icon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3 text-gray-200">{value.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-xs lg:text-sm">{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Team Section */}
            <section>
              <h2 className="text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 text-center text-gray-200">Tim Pengembang</h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700/30 hover:border-green-400/30 transition-all duration-300">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <member.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 text-gray-200 break-words">{member.name}</h3>
                        <p className="text-green-400 font-medium mb-1 text-xs sm:text-sm lg:text-base break-words">{member.role}</p>
                        <p className="text-blue-300 text-xs sm:text-sm mb-2 break-words">{member.school}</p>
                        <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">{member.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Learning Outcomes Section */}
            <section>
              <h2 className="text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 text-center text-gray-200">Yang Kami Pelajari</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700/30 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:-translate-y-1 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                      <outcome.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 text-gray-200">{outcome.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">{outcome.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements Section */}
            <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-green-500/30">
              <h2 className="text-2xl lg:text-3xl font-semibold mb-6 lg:mb-8 text-center text-gray-200 flex items-center justify-center gap-3 flex-wrap">
                <Award className="w-6 h-6 lg:w-8 lg:h-8 text-green-400 flex-shrink-0" />
                <span>Pencapaian Selama PKL</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 lg:p-4 rounded-xl hover:bg-gray-700/30 transition-colors duration-200">
                    <Award className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm lg:text-base">{achievement}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* School & Supervision Section */}
            <section className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-gray-700/30">
              <h2 className="text-2xl lg:text-3xl font-semibold mb-6 lg:mb-8 text-center text-gray-200">Bimbingan & Dukungan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 lg:p-6 rounded-xl hover:bg-gray-700/30 transition-colors duration-200 text-center">
                  <GraduationCap className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-200">SMK Negeri 1 Teknologi Informasi</h3>
                  <p className="text-gray-400 text-sm">Sekolah yang memberikan bekal ilmu dan keterampilan dalam bidang teknologi informasi</p>
                </div>
                
                <div className="p-4 lg:p-6 rounded-xl hover:bg-gray-700/30 transition-colors duration-200 text-center">
                  <Building className="w-8 h-8 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-200">Universitas Mitra PKL</h3>
                  <p className="text-gray-400 text-sm">Tempat pelaksanaan PKL yang memberikan kesempatan untuk mengimplementasikan sistem</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-gray-700/30">
              <h2 className="text-2xl lg:text-3xl font-semibold mb-6 lg:mb-8 text-center text-gray-200">Hubungi Tim Kami</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div className="p-4 lg:p-6 rounded-xl hover:bg-gray-700/30 transition-colors duration-200 text-center">
                  <Mail className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400 mx-auto mb-3 lg:mb-4" />
                  <h3 className="text-base lg:text-lg font-semibold mb-2 text-gray-200">Email Tim</h3>
                  <p className="text-gray-400 text-sm lg:text-base break-all">tim.racsi@smk.ac.id</p>
                </div>
                
                <div className="p-4 lg:p-6 rounded-xl hover:bg-gray-700/30 transition-colors duration-200 text-center">
                  <Phone className="w-6 h-6 lg:w-8 lg:h-8 text-green-400 mx-auto mb-3 lg:mb-4" />
                  <h3 className="text-base lg:text-lg font-semibold mb-2 text-gray-200">WhatsApp</h3>
                  <p className="text-gray-400 text-sm lg:text-base">+62 812 3456 7890</p>
                </div>
                
                <div className="p-4 lg:p-6 rounded-xl hover:bg-gray-700/30 transition-colors duration-200 text-center">
                  <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400 mx-auto mb-3 lg:mb-4" />
                  <h3 className="text-base lg:text-lg font-semibold mb-2 text-gray-200">Sekolah</h3>
                  <p className="text-gray-400 text-sm lg:text-base">SMK Negeri 1 Teknologi Informasi</p>
                </div>
              </div>
            </section>

            {/* Gratitude Section */}
            <section className="text-center">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-purple-500/30">
                <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-gray-200">Terima Kasih</h2>
                <p className="text-gray-300 text-sm lg:text-lg mb-6 leading-relaxed max-w-2xl mx-auto">
                  Terima kasih kepada semua pihak yang telah mendukung kami dalam proyek PKL ini. 
                  Pengalaman ini sangat berharga untuk persiapan kami memasuki dunia kerja di bidang teknologi informasi.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-300 flex-wrap">
                  <Heart className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base lg:text-lg">Dibuat dengan dedikasi oleh tim SMK</span>
                  <Heart className="w-5 h-5 flex-shrink-0" />
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
            <p>© 2025 RACSI - Room and Control Schedule Interface | Proyek PKL SMK Negeri 1 Teknologi Informasi</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default About;