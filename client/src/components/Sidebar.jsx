import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="bg-white w-20 md:w-56 border-r border-gray-300 flex flex-col items-center md:items-start py-6 px-2 md:px-6">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-12 w-full">
        <div className="bg-black rounded-md p-3 flex justify-center items-center">
          <i className="fas fa-desktop text-white text-xl"></i>
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
          <i className="fas fa-th-large text-lg"></i>
          <span className="hidden md:inline">Dashboard</span>
        </Link>

        <Link
          to="/admin/gedung"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <i className="fas fa-building text-lg"></i>
          <span className="hidden md:inline">Gedung</span>
        </Link>

        <Link
          to="/admin/lantai"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <i className="fas fa-layer-group text-lg"></i>
          <span className="hidden md:inline">Lantai</span>
        </Link>

        <Link
          to="/admin/ruangan"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <i className="fas fa-door-closed text-lg"></i>
          <span className="hidden md:inline">Ruangan</span>
        </Link>

        <Link
          to="/admin/kegiatan"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <i className="fas fa-clipboard-list text-lg"></i>
          <span className="hidden md:inline">Kegiatan</span>
        </Link>

        <Link
          to="/admin/jadwal"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <i className="fas fa-calendar-alt text-lg"></i>
          <span className="hidden md:inline">Jadwal</span>
        </Link>

        <Link
          to="/admin/riwayat"
          className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-black"
        >
          <i className="fas fa-history text-lg"></i>
          <span className="hidden md:inline">Riwayat</span>
        </Link>
      </nav>
    </aside>
  );
}
