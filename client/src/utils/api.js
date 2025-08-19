export const fetchDataTV = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/data_tv');
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return []; // Return array kosong untuk hindari crash
    }
    return await response.json(); // Harus array dari backend
  } catch (error) {
    console.error('Fetch error:', error);
    return []; // Fallback aman
  }
};

// src/utils/api.js
import axios from "axios";

export const fetchGedung = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/gedung");
    return res.data; // mengembalikan array gedung
  } catch (error) {
    console.error("Gagal mengambil data gedung:", error);
    return [];
  }
};

export const fetchRuangan = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/ruangan/with-jadwal");
    return res.data;
  } catch (error) {
    console.error("Gagal mengambil data ruangan:", error);
    return [];
  }
};

export const fetchJadwal = async () => {
  // Implementasi sesuai kebutuhan Anda
  return [];
};
