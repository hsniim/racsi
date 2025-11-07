const pool = require('../config/db');

// Ambil semua histori kegiatan terbaru dengan detail gedung, lantai, ruangan
const getRiwayat = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         h.id_histori,
         h.nama_kegiatan AS kegiatan,
         h.pengguna,
         g.nama_gedung AS gedung,
         l.nomor_lantai AS lantai,
         r.nama_ruangan AS ruangan,
         CONCAT(h.tanggal, ' ', h.waktu_mulai, ' - ', h.waktu_selesai) AS jadwal
       FROM histori_kegiatan_jadwal h
       JOIN ruangan r ON h.id_ruangan = r.id_ruangan
       JOIN lantai l ON r.id_lantai = l.id_lantai
       JOIN gedung g ON l.id_gedung = g.id_gedung
       ORDER BY h.created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error getRiwayat:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Tambah kegiatan baru ke histori (opsional)
const addRiwayat = async (req, res) => {
  const { id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO histori_kegiatan_jadwal 
       (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai]
    );
    res.status(201).json({ message: 'Kegiatan berhasil ditambahkan', id: result.insertId });
  } catch (error) {
    console.error("Error addRiwayat:", error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getRiwayat,
  addRiwayat,
};
