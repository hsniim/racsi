import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null); // null = belum dicek
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        // Cek validasi token ke backend
        const res = await axios.get("http://localhost:5000/api/admin/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.valid) {
          setIsValid(true);
        } else {
          setIsValid(false);
          localStorage.removeItem("adminToken");
        }
      } catch (err) {
        console.warn("Token verification failed:", err.response?.data || err.message);
        localStorage.removeItem("adminToken");
        setIsValid(false);
      }
    };

    verifyToken();
  }, [token]);

  // ⏳ Saat proses verifikasi token, jangan tampilkan halaman dulu
  if (isValid === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Memeriksa sesi login...
      </div>
    );
  }

  // ❌ Kalau token tidak valid → kembalikan ke login
  if (!isValid) {
    return <Navigate to="/admin" replace />;
  }

  // ✅ Kalau token valid → tampilkan halaman admin
  return children;
}
