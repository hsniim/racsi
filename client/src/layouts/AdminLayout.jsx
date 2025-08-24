import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();

  const pageTitles = {
    "/admin/dashboard": "Dashboard",
    "/admin/gedung": "Gedung",
    "/admin/lantai": "Lantai",
    "/admin/ruangan": "Ruangan",
    "/admin/kegiatan": "Kegiatan",
    "/admin/jadwal": "Jadwal",
    "/admin/riwayat": "Riwayat",
  };

  const title = pageTitles[location.pathname] || "Halaman Admin";

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar tetap fix di kiri */}
      <Sidebar />

      {/* Main area bisa scroll */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <h1 className="font-extrabold text-lg md:text-xl mb-6 select-none">
          {title}
        </h1>
        <Outlet />
      </main>

    </div>
  );
}
