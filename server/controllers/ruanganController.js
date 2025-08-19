const pool = require('../config/db');

const addRuangan = async (req, res) => {
  const { id_lantai, nama_ruangan, kapasitas, status } = req.body;
  if (!id_lantai || !nama_ruangan || !kapasitas) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO ruangan (id_lantai, nama_ruangan, kapasitas, status) VALUES (?, ?, ?, ?)',
      [id_lantai, nama_ruangan, kapasitas, status || 'tidak_digunakan']
    );
    res.status(201).json({ id_ruangan: result.insertId, message: 'Ruangan berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding ruangan:', error);
    res.status(500).json({ message: 'Gagal menambahkan ruangan', error });
  }
};

const getRuanganWithJadwal = async (req, res) => {
  try {
const [rows] = await pool.query(`
  SELECT r.id_ruangan, r.nama_ruangan, r.kapasitas, r.status,
         j.id_jadwal,
         DATE_FORMAT(j.tanggal, '%Y-%m-%d') AS tanggal,   -- ✅ fix format
         j.waktu_mulai, j.waktu_selesai,
         k.id_kegiatan, k.nama_kegiatan, k.pengguna
  FROM ruangan r
  LEFT JOIN kegiatan k ON r.id_ruangan = k.id_ruangan
  LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
    AND j.tanggal = CURDATE()
  ORDER BY r.id_ruangan, j.waktu_mulai;
`);

    // Gabungkan data jadwal per ruangan
    const ruanganMap = {};
    rows.forEach(row => {
      if (!ruanganMap[row.id_ruangan]) {
        ruanganMap[row.id_ruangan] = {
          id_ruangan: row.id_ruangan,
          nama_ruangan: row.nama_ruangan,
          kapasitas: row.kapasitas,
          status: row.status,
          jadwal_list: []
        };
      }

      if (row.id_jadwal) {
        ruanganMap[row.id_ruangan].jadwal_list.push({
          id_jadwal: row.id_jadwal,
          tanggal: row.tanggal,
          waktu_mulai: row.waktu_mulai,
          waktu_selesai: row.waktu_selesai,
          id_kegiatan: row.id_kegiatan,
          nama_kegiatan: row.nama_kegiatan,
          pengguna: row.pengguna
        });
      }
    });

    res.json(Object.values(ruanganMap));
  } catch (error) {
    console.error("Error fetching ruangan with jadwal:", error);
    res.status(500).json({ message: "Gagal mengambil data", error });
  }
};

module.exports = { addRuangan, getRuanganWithJadwal };