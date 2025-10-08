import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle, Home } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { 
        username, 
        password 
      });
      
      localStorage.setItem('token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Login gagal! Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="w-full min-h-screen bg-primary text-white relative overflow-hidden">
      {/* Enhanced Background with Parallax Effect - Matching Home.jsx */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-primary to-indigo-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/10 via-transparent to-blue-900/10"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', transform: 'translate(-50%, -50%)' }}></div>
        
        {/* Animated Geometric Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-400/40 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-indigo-400/40 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-96 left-1/4 w-16 h-16 border-2 border-purple-400/40 rounded-full animate-bounce" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-80 right-1/3 w-20 h-20 border-2 border-blue-400/40 rounded-lg rotate-12 animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-28 h-28 border-2 border-indigo-400/30 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-10 w-20 h-20 border-2 border-purple-400/30 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 w-full min-h-screen">
        
        {/* Header - KONSISTEN DENGAN LANDING PAGE */}
        <header className="w-full p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-30 h-30 flex items-center justify-center">
                <img src="assets/racsi_logo.svg" alt="RACSI Logo" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">RACSI</h1>
          </div>
          
          {/* Back to Home Button - Menggantikan Admin Login Button */}
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-lg rounded-xl border border-gray-700/30 hover:border-blue-400/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-gray-200">Kembali ke Beranda</span>
          </button>
        </header>

        {/* Main Login Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-180px)] px-6">
          <div className="w-full max-w-md">
            {/* Logo and Title Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <img src="assets/racsi_logo.svg" alt="RACSI Logo" />
              </div>
              
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                RACSI Admin
              </h1>
              <p className="text-gray-400">
                Silakan masuk untuk mengakses panel admin
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/30">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-gray-200">Masuk ke Admin Panel</h2>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-600/20 border border-red-400/30 rounded-xl flex items-center gap-3 text-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full mt-8 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memproses Login...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Masuk ke Admin Panel
                    </>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3 text-blue-400 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>
                    Area terbatas untuk administrator sistem RACSI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Konsisten dengan Landing Page */}
        <footer className="w-full p-6 text-center text-gray-400 text-sm">
          <p>© 2025 RACSI - Room and Control Schedule Interface</p>
        </footer>
      </div>
    </div>
  );
}


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