const pool = require('../config/db');

const getDataTV = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.id_ruangan,
        r.nama_ruangan,
        r.kapasitas,
        l.nomor_lantai,
        g.nama_gedung,
        g.lokasi_gedung,
        g.pj_gedung,
        j.id_jadwal,
        DATE_FORMAT(j.tanggal, '%Y-%m-%d') AS tanggal,
        j.waktu_mulai,
        j.waktu_selesai,
        k.pengguna
      FROM ruangan r
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      LEFT JOIN kegiatan k ON r.id_ruangan = k.id_ruangan
      LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
      ORDER BY r.id_ruangan, j.tanggal, j.waktu_mulai
    `);

    // Group jadwal per ruangan
    const ruanganMap = {};
    rows.forEach(row => {
      if (!ruanganMap[row.id_ruangan]) {
        ruanganMap[row.id_ruangan] = {
          id_ruangan: row.id_ruangan,
          nama_ruangan: row.nama_ruangan,
          kapasitas: row.kapasitas,
          nomor_lantai: row.nomor_lantai,
          nama_gedung: row.nama_gedung,
          lokasi_gedung: row.lokasi_gedung,
          pj_gedung: row.pj_gedung,
          jadwal_list: []
        };
      }
      if (row.id_jadwal) {
        ruanganMap[row.id_ruangan].jadwal_list.push({
          id_jadwal: row.id_jadwal,
          tanggal: row.tanggal, // sudah dalam format YYYY-MM-DD
          waktu_mulai: row.waktu_mulai,
          waktu_selesai: row.waktu_selesai,
          pengguna: row.pengguna
        });
      }
    });

    const data = Object.values(ruanganMap);
    res.json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Error fetching data TV', error });
  }
};

console.log('Server date (debug):', new Date().toString());

module.exports = { getDataTV };
