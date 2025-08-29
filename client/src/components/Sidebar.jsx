import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Layers,
  DoorClosed,
  ClipboardList,
  CalendarDays,
  History,
  Monitor,
  User
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const getLinkClasses = (path) => {
    const base =
      "flex items-center space-x-3 font-semibold text-gray-800 rounded-md px-2 py-2 transition-colors";
    const hoverActive = "hover:bg-blue-100 active:bg-blue-200";
    const active = location.pathname === path ? "bg-blue-100" : "";
    return `${base} ${hoverActive} ${active}`;
  };

  return (
    <aside className="bg-white w-20 md:w-56 border-r border-gray-300 flex flex-col items-center md:items-start py-6 px-2 md:px-6 h-full">

      {/* Logo */}
      <div className="flex items-center space-x-2 mb-6 w-full">
        <div className="bg-black rounded-md p-3 flex justify-center items-center">
          <Monitor className="text-white" size={20} />
        </div>
        <span className="hidden md:inline font-extrabold text-xl select-none text-black">
          RACSI
        </span>
      </div>

      {/* Menu Utama */}
      <nav className="flex flex-col space-y-2 w-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 96px)' }}>
        <Link to="/admin/dashboard" className={getLinkClasses("/admin/dashboard")}>
          <LayoutDashboard size={20} />
          <span className="hidden md:inline">Dashboard</span>
        </Link>

        <Link to="/admin/gedung" className={getLinkClasses("/admin/gedung")}>
          <Building2 size={20} />
          <span className="hidden md:inline">Gedung</span>
        </Link>

        <Link to="/admin/pj_gedung" className={getLinkClasses("/admin/pj_gedung")}>
          <User size={20} />
          <span className="hidden md:inline">Pj Gedung</span>
        </Link>

        <Link to="/admin/lantai" className={getLinkClasses("/admin/lantai")}>
          <Layers size={20} />
          <span className="hidden md:inline">Lantai</span>
        </Link>

        <Link to="/admin/pj_lantai" className={getLinkClasses("/admin/pj_lantai")}>
          <User size={20} />
          <span className="hidden md:inline">Pj Lantai</span>
        </Link>

        <Link to="/admin/ruangan" className={getLinkClasses("/admin/ruangan")}>
          <DoorClosed size={20} />
          <span className="hidden md:inline">Ruangan</span>
        </Link>

        <Link to="/admin/kegiatan" className={getLinkClasses("/admin/kegiatan")}>
          <ClipboardList size={20} />
          <span className="hidden md:inline">Kegiatan</span>
        </Link>

        <Link to="/admin/jadwal" className={getLinkClasses("/admin/jadwal")}>
          <CalendarDays size={20} />
          <span className="hidden md:inline">Jadwal</span>
        </Link>

        {/* Menu Footer */}
        <div className="mt-auto w-full">
          <Link to="/admin/riwayat" className={getLinkClasses("/admin/riwayat")}>
            <History size={20} />
            <span className="hidden md:inline">Riwayat</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
