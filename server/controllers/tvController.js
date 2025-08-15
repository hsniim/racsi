const pool = require('../config/db');

const getDataTV = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        r.id_ruangan, r.nama_ruangan, r.kapasitas, r.status,
        j.id_jadwal, j.tanggal, j.waktu_mulai, j.waktu_selesai,
        k.id_kegiatan, k.nama_kegiatan, k.deskripsi_kegiatan, k.pengguna,
        l.nomor_lantai, g.nama_gedung, g.lokasi_gedung, g.pj_gedung
      FROM ruangan r
      LEFT JOIN kegiatan k ON r.id_ruangan = k.id_ruangan
      LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan AND (j.tanggal = CURDATE() OR j.tanggal IS NULL)
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      ORDER BY g.nama_gedung, l.nomor_lantai, r.nama_ruangan, j.waktu_mulai
      `
    );
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Error fetching data TV', error });
  }
};

module.exports = { getDataTV };
