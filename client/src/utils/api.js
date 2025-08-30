import axios from "axios";

export const fetchDataTV = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/data_tv');
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};

export const fetchGedung = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/gedung");
    return res.data;
  } catch (error) {
    console.error("Gagal mengambil data gedung:", error);
    return [];
  }
};

export const fetchRuangan = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/ruangan/with-jadwal", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Gagal mengambil data ruangan:", error.response?.data || error.message);
    return [];
  }
};

export const fetchJadwal = async () => {
  // Implementasi sesuai kebutuhan Anda
  return [];
};

// BARU: Fungsi untuk ambil data header (nama gedung, lantai, PJ)
export const fetchHeaderData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/header");
    return response.data.data; // return object dengan nama_gedung, nomor_lantai, pj_lantaipagi, pj_lantaisiang
  } catch (error) {
    console.error("Gagal mengambil data header:", error.response?.data || error.message);
    // Return default fallback data
    return {
      nama_gedung: "RACSI",
      nomor_lantai: 3,
      pj_lantaipagi: "Pak Budi",
      pj_lantaisiang: "Pak Nasir"
    };
  }
};

// OPSIONAL: Fungsi untuk ambil data header berdasarkan ID spesifik
export const fetchHeaderDataByIds = async (id_gedung, id_lantai) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/header/${id_gedung}/${id_lantai}`);
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data header spesifik:", error.response?.data || error.message);
    return {
      nama_gedung: "RACSI",
      nomor_lantai: 3,
      pj_lantaipagi: "Pak Budi",
      pj_lantaisiang: "Pak Nasir"
    };
  }
};

// Fungsi untuk ambil data PJ Gedung
export const fetchPjGedung = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/pj-gedung");
    return response.data.data; // return array of pj_gedung data
  } catch (error) {
    console.error("Gagal mengambil data PJ Gedung:", error.response?.data || error.message);
    // Return default fallback data
    return [{
      nama: "Husni",
      no_telp: "0899-8378-498",
      link_peminjaman: "https://www.example.com",
      qrcodepath_pinjam: "/assets/qrcode_peminjaman/jakarta/sksg/qrcode_peminjamansksg.png",
      qrcodepath_kontak: "/assets/qrcode_pjgedung/jakarta/sksg/qrcode_husni.png"
    }];
  }
};
