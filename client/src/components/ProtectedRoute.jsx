import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Jika tidak ada token, arahkan ke login
  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  // Jika pakai children (App.jsx sudah pakai children)
  if (children) return children;

  // Jika dipakai dengan Outlet (opsional)
  return <Outlet />;
}
