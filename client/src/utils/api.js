import axios from "axios";
import QRCode from "qrcode"; // Legacy QR Code generator

const API_BASE_URL = "https://racsi-production.up.railway.app/"; // kalau local http://localhost:5000/api 

// ================= QR CODE UTILITIES (Legacy Only) ==================
// Function to check if string is a URL
export const isUrl = (string) => {
  if (!string) return false;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Check if QR code is base64 data URL
export const isBase64QR = (string) => {
  return string && string.startsWith('data:image/png;base64,');
};

// Function to generate QR Code using legacy qrcode library (client-side)
export const generateQRCodeLegacy = async (url, options = {}) => {
  try {
    console.log('Generating QR Code with legacy library for:', url);
    
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: options.width || 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    // Generate QR code as data URL (base64)
    const dataUrl = await QRCode.toDataURL(url, qrOptions);
    
    console.log('QR Code generated successfully with legacy library');
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code with legacy library:', error);
    throw error;
  }
};

// Function to get QR code for gedung feedback
export const getGedungFeedbackQR = async (id_gedung) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gedung/${id_gedung}/qr-feedback`);
    return response.data;
  } catch (error) {
    console.error("Error fetching gedung feedback QR:", error);
    throw error;
  }
};

// Function to generate and save QR code for gedung feedback
export const generateGedungFeedbackQR = async (id_gedung, url) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gedung/${id_gedung}/generate-qr-feedback`, 
      { url }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating gedung feedback QR:", error);
    throw error;
  }
};

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
      nomor_lantai: "tidak diketahui",
      pj_lantaipagi: "Tidak diketahui",
      pj_lantaisiang: "Tidak diketahui",
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
      nomor_lantai: "tidak diketahui",
      pj_lantaipagi: "Tidak diketahui",
      pj_lantaisiang: "Tidak diketahui",
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
        nama: "Tidak diketahui",
        no_telp: "08xx",
        link_peminjaman: "https://www.example.com",
        qrcodepath_pinjam: "/assets/qrcode_peminjaman",
        qrcodepath_kontak: "/assets/qrcode_pjgedung",
      },
    ];
  }
};

export const fetchPjGedungByGedung = async (id_gedung) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pj-gedung/gedung/${id_gedung}`);
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data PJ Gedung by gedung:", error.response?.data || error.message);
    return [
      {
        nama: "Tidak diketahui",
        no_telp: "08xx",
        link_peminjaman: "https://www.example.com",
        qrcodepath_pinjam: "/assets/qrcode_peminjaman",
        qrcodepath_kontak: "/assets/qrcode_pjgedung",
      },
    ];
  }
};

// ================= RUANGAN ==================
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

// ================= FEEDBACK API FUNCTIONS ==================
export const createFeedback = async (feedbackData) => {
  try {
    console.log('Creating feedback:', feedbackData);
    
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create feedback error:', errorData);
      throw new Error(errorData.message || 'Failed to submit feedback');
    }
    
    const result = await response.json();
    console.log('Feedback created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

export const updateFeedback = async (id, feedbackData) => {
  try {
    console.log('Updating feedback:', { id, feedbackData });
    
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update feedback error:', errorData);
      throw new Error(errorData.message || 'Failed to update feedback');
    }
    
    const result = await response.json();
    console.log('Feedback updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

export const deleteFeedback = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete feedback error:', errorData);
      throw new Error(errorData.message || 'Failed to delete feedback');
    }
    
    const result = await response.json();
    console.log('Feedback deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

export const getAllFeedback = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Get all feedback error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch feedbacks');
    }
    
    const result = await response.json();
    console.log('All feedbacks fetched successfully');
    return result;
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    throw error;
  }
};

export const getFeedbackById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Get feedback by ID error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch feedback');
    }
    
    const result = await response.json();
    console.log('Feedback fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    throw error;
  }
};

export const fetchFeedbackSummary = async (id_gedung, id_lantai) => {
  try {
    const url = `${API_BASE_URL}/feedback/summary?id_gedung=${id_gedung}&id_lantai=${id_lantai}`;
    console.log(`Fetching feedback summary from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch feedback summary: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Feedback summary response:', data);
    
    return {
      summary: Array.isArray(data.summary) ? data.summary : [],
      recent_comments: Array.isArray(data.recent_comments) 
        ? data.recent_comments
        : []
    };
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    return { 
      summary: [], 
      recent_comments: [] 
    };
  }
};

export const fetchFeedbackStats = async (periode = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/stats?periode=${periode}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    throw error;
  }
};

export const fetchFeedbackByRuangan = async (id_ruangan, options = {}) => {
  try {
    const { page = 1, limit = 10, kategori } = options;
    let url = `${API_BASE_URL}/feedback/ruangan/${id_ruangan}?page=${page}&limit=${limit}`;
    
    if (kategori) {
      url += `&kategori=${kategori}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback by ruangan');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback by ruangan:', error);
    throw error;
  }
};

export const testFeedbackEndpoint = async (id_gedung, id_lantai) => {
  try {
    console.log('Testing feedback endpoint...');
    const response = await fetch(`${API_BASE_URL}/feedback/summary?id_gedung=${id_gedung}&id_lantai=${id_lantai}`);
    const data = await response.text();
    console.log('Raw response:', data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', jsonData);
        return jsonData;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return { error: 'Invalid JSON response' };
      }
    } else {
      return { error: `HTTP ${response.status}: ${data}` };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { error: error.message };
  }
};

// ================= ADMIN ROOM INFO FUNCTIONS ==================
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
      pj_lantaipagi: "Tidak diketahui",
      pj_lantaisiang: "Tidak diketahui",
    };
  }
};

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
        nama: "Tidak diketahui",
        no_telp: "08xx",
        link_peminjaman: "https://www.example.com",
        qrcodepath_pinjam: "/assets/qrcode_peminjaman",
        qrcodepath_kontak: "/assets/qrcode_pjgedung",
      },
    ];
  }
};

export const fetchPjGedungAdminByGedung = async (id_gedung) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/pj-gedung/gedung/${id_gedung}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data PJ Gedung admin by gedung:", error.response?.data || error.message);
    return [
      {
        nama: "Tidak diketahui",
        no_telp: "08xx",
        link_peminjaman: "https://www.example.com",
        qrcodepath_pinjam: "/assets/qrcode_peminjaman",
        qrcodepath_kontak: "/assets/qrcode_pjgedung",
      },
    ];
  }
};