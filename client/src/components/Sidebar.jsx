import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Layers,
  DoorClosed,
  ClipboardList,
  CalendarDays,
  History,
  Monitor,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="bg-white w-20 md:w-56 border-r border-gray-300 flex flex-col items-center md:items-start py-6 px-2 md:px-6">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-12 w-full">
        <div className="bg-black rounded-md p-3 flex justify-center items-center">
          <Monitor className="text-white" size={20} />
        </div>
        <span className="hidden md:inline font-extrabold text-xl select-none text-black">
          RACSI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-6 w-full">
        <Link
          to="/admin/dashboard"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <LayoutDashboard size={20} />
          <span className="hidden md:inline">Dashboard</span>
        </Link>

        <Link
          to="/admin/gedung"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <Building2 size={20} />
          <span className="hidden md:inline">Gedung</span>
        </Link>

        <Link
          to="/admin/lantai"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <Layers size={20} />
          <span className="hidden md:inline">Lantai</span>
        </Link>

        <Link
          to="/admin/ruangan"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <DoorClosed size={20} />
          <span className="hidden md:inline">Ruangan</span>
        </Link>

        <Link
          to="/admin/kegiatan"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <ClipboardList size={20} />
          <span className="hidden md:inline">Kegiatan</span>
        </Link>

        <Link
          to="/admin/jadwal"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <CalendarDays size={20} />
          <span className="hidden md:inline">Jadwal</span>
        </Link>

        <Link
          to="/admin/riwayat"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <History size={20} />
          <span className="hidden md:inline">Riwayat</span>
        </Link>
      </nav>
    </aside>
  );
}
