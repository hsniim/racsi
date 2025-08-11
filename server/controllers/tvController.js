const pool = require('../config/db');

const getDataTV = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_ruangan, r.nama_ruangan, r.kapasitas, r.status,
             j.id_jadwal, j.tanggal, j.waktu_mulai, j.waktu_selesai,
             k.id_kegiatan, k.nama_kegiatan, k.deskripsi_kegiatan, k.pengguna,
             l.nomor_lantai, g.nama_gedung, g.lokasi_gedung, g.pj_gedung
      FROM ruangan r
      LEFT JOIN jadwal j ON r.id_ruangan = j.id_ruangan
      LEFT JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      WHERE j.tanggal = CURDATE() OR j.tanggal IS NULL;  // Hanya jadwal hari ini
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data TV', error });
  }
};

module.exports = { getDataTV };