import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Layers,
  DoorClosed,
  ClipboardList,
  History,
  Monitor,
  MessagesSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminUsername, setAdminUsername] = useState('Admin');

  // Get admin username from token or localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get username (if it's stored in JWT)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.username) {
          setAdminUsername(payload.username);
        }
      } catch (error) {
        // If JWT decode fails, check if username is stored separately
        const storedUsername = localStorage.getItem('adminUsername');
        if (storedUsername) {
          setAdminUsername(storedUsername);
        }
      }
    }
  }, []);

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    return `
      flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
      ${isActive 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
      }
    `;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      path: "/admin/gedung",
      icon: Building2,
      label: "Gedung"
    },
    {
      path: "/admin/lantai",
      icon: Layers,
      label: "Lantai"
    },
    {
      path: "/admin/ruangan",
      icon: DoorClosed,
      label: "Ruangan"
    },
    {
      path: "/admin/agenda",
      icon: ClipboardList,
      label: "Agenda"
    }
  ];

  const footerItems = [
    {
      path: "/admin/riwayat",
      icon: History,
      label: "Riwayat"
    },
    {
      path: "/admin/feedback",
      icon: MessagesSquare,
      label: "Feedback"
    }
  ];

  return (
    <aside className={`
      bg-gray-800/50 border-r border-gray-700/50 flex flex-col h-full transition-all duration-300 relative
      ${isCollapsed ? 'w-16' : 'w-20 md:w-64'}
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 right-4 w-8 h-8 border border-white/20 rounded-full"></div>
        <div className="absolute top-32 left-3 w-6 h-6 border border-white/20 rounded-lg rotate-45"></div>
        <div className="absolute bottom-32 right-4 w-6 h-6 border border-white/20 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <img src="/assets/racsi_logo.svg" alt="" />
            </div>
            {!isCollapsed && (
              <div className="hidden md:block">
                <h1 className="font-bold text-2xl text-white">RACSI</h1>
                <p className="text-md text-gray-400">Dashboard Admin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10">
        {/* Main Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClasses(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="hidden md:inline font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="py-4">
          <div className="border-t border-gray-700/50"></div>
        </div>

        {/* Footer Menu Items */}
        <div className="space-y-1">
          {footerItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClasses(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="hidden md:inline font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700/50 space-y-2 relative z-10">
        {/* Go to Home */}
        <button
          onClick={handleGoHome}
          className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700/50 w-full"
          title={isCollapsed ? "Ke Beranda" : ''}
        >
          <Home size={20} />
          {!isCollapsed && (
            <span className="hidden md:inline font-medium">Ke Beranda</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-red-400 hover:text-white hover:bg-red-600/20 w-full group"
          title={isCollapsed ? "Keluar" : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && (
            <span className="hidden md:inline font-medium">Keluar</span>
          )}
        </button>

        {/* User Info */}
        {!isCollapsed && (
          <div className="hidden md:block pt-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{adminUsername.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{adminUsername}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}