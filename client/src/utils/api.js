import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// ================= UTILS GENERAL ==================
export const fetchDataTV = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/data_tv`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const fetchGedung = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/gedung`);
    return res.data;
  } catch (error) {
    console.error("Gagal mengambil data gedung:", error);
    return [];
  }
};

export const fetchJadwal = async () => {
  // Implementasi sesuai kebutuhan Anda
  return [];
};

// ================= HEADER DATA ==================
export const fetchHeaderData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/header`);
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data header:", error.response?.data || error.message);
    return {
      nama_gedung: "RACSI",
      nomor_lantai: 3,
      pj_lantaipagi: "Pak Budi",
      pj_lantaisiang: "Pak Nasir",
    };
  }
};

export const fetchHeaderDataByIds = async (id_gedung, id_lantai) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/header/${id_gedung}/${id_lantai}`);
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data header spesifik:", error.response?.data || error.message);
    return {
      nama_gedung: "RACSI",
      nomor_lantai: 3,
      pj_lantaipagi: "Pak Budi",
      pj_lantaisiang: "Pak Nasir",
    };
  }
};

// ================= PJ GEDUNG ==================
export const fetchPjGedung = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pj-gedung`);
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data PJ Gedung:", error.response?.data || error.message);
    return [
      {
        nama: "Husni",
        no_telp: "0899-8378-498",
        link_peminjaman: "https://www.example.com",
        qrcodepath_pinjam: "/assets/qrcode_peminjaman/jakarta/sksg/qrcode_peminjamansksg.png",
        qrcodepath_kontak: "/assets/qrcode_pjgedung/jakarta/sksg/qrcode_husni.png",
      },
    ];
  }
};

// ================= RUANGAN ==================
// Default wrapper untuk Home/App (pakai public endpoint)
const DEFAULT_GEDUNG = 1;
const DEFAULT_LANTAI = 1;

export const fetchRuangan = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/ruangan/public/with-jadwal?id_gedung=${DEFAULT_GEDUNG}&id_lantai=${DEFAULT_LANTAI}`
    );
    return res.data;
  } catch (err) {
    console.error("Gagal mengambil data ruangan:", err.response?.data || err.message);
    return [];
  }
};

export const fetchRuanganByGedungLantai = async (id_gedung, id_lantai) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/ruangan/public/with-jadwal?id_gedung=${id_gedung}&id_lantai=${id_lantai}`
    );
    return res.data;
  } catch (err) {
    console.error("Gagal fetch ruangan by gedung & lantai:", err);
    return [];
  }
};

export const fetchRuanganByGedungLantaiTv = async (id_gedung, id_lantai) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/ruangan/tv/with-jadwal?id_gedung=${id_gedung}&id_lantai=${id_lantai}`
    );
    return res.data;
  } catch (err) {
    console.error("Gagal fetch ruangan TV:", err);
    return [];
  }
};

// ================= ADMIN FUNCTIONS ==================
// Fungsi untuk dashboard admin
export const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil stats dashboard:", error.response?.data || error.message);
    return {
      totalGedung: 0,
      totalLantai: 0,
      totalRuangan: 0,
      rooms: []
    };
  }
};

// Fungsi untuk mengambil list gedung & lantai untuk admin dashboard
export const fetchGedungLantaiList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/admin/gedung-lantai-list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil list gedung lantai:", error.response?.data || error.message);
    return [];
  }
};

// ================= ADMIN ROOM INFO FUNCTIONS ==================
// Fungsi khusus untuk AdminRoomInfoPage - menggunakan endpoint TV dengan auth admin
export const fetchRuanganAdminByGedungLantai = async (id_gedung, id_lantai) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_BASE_URL}/ruangan/tv/with-jadwal?id_gedung=${id_gedung}&id_lantai=${id_lantai}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Gagal fetch ruangan admin by gedung & lantai:", err.response?.data || err.message);
    return [];
  }
};

// Fungsi untuk header data dengan auth admin
export const fetchHeaderDataAdminByIds = async (id_gedung, id_lantai) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/header/${id_gedung}/${id_lantai}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data header admin spesifik:", error.response?.data || error.message);
    return {
      nama_gedung: "RACSI",
      nomor_lantai: 3,
      pj_lantaipagi: "Pak Budi",
      pj_lantaisiang: "Pak Nasir",
    };
  }
};

// Fungsi untuk PJ Gedung dengan auth admin
export const fetchPjGedungAdmin = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/pj-gedung`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data PJ Gedung admin:", error.response?.data || error.message);
    return [
      {
        nama: "Husni",
        no_telp: "0899-8378-498",
        link_peminjaman: "https://www.example.com",
        qrcodepath_pinjam: "/assets/qrcode_peminjaman/jakarta/sksg/qrcode_peminjamansksg.png",
        qrcodepath_kontak: "/assets/qrcode_pjgedung/jakarta/sksg/qrcode_husni.png",
      },
    ];
  }
};