const pool = require('../config/db');

// Tambah ruangan
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

// Ambil semua ruangan + info lantai & gedung
const getRuangans = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_ruangan, r.nama_ruangan, r.kapasitas, r.status,
             l.nomor_lantai, g.nama_gedung
      FROM ruangan r
      JOIN lantai l ON r.id_lantai = l.id_lantai
      JOIN gedung g ON l.id_gedung = g.id_gedung
      ORDER BY g.nama_gedung ASC, l.nomor_lantai ASC, r.nama_ruangan ASC
    `);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error fetching ruangan:', error);
    res.status(500).json({ message: 'Gagal mengambil data ruangan', error });
  }
};

// Ambil ruangan + jadwal hari ini (butuh token)
const getRuanganWithJadwal = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_ruangan, r.nama_ruangan, r.kapasitas, r.status,
             l.id_lantai, l.nomor_lantai,
             g.id_gedung, g.nama_gedung,
             j.id_jadwal,
             DATE_FORMAT(j.tanggal, '%Y-%m-%d') AS tanggal,
             TIME_FORMAT(j.waktu_mulai, '%H:%i') AS waktu_mulai,
             TIME_FORMAT(j.waktu_selesai, '%H:%i') AS waktu_selesai,
             k.id_kegiatan, k.nama_kegiatan, k.pengguna, k.deskripsi_kegiatan
      FROM ruangan r
      JOIN lantai l ON r.id_lantai = l.id_lantai
      JOIN gedung g ON l.id_gedung = g.id_gedung
      LEFT JOIN kegiatan k ON r.id_ruangan = k.id_ruangan
      LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
       AND j.tanggal = CURDATE()
      ORDER BY g.nama_gedung, l.nomor_lantai, r.nama_ruangan, j.waktu_mulai;
    `);

    const ruanganMap = {};

    rows.forEach(row => {
      if (!ruanganMap[row.id_ruangan]) {
        ruanganMap[row.id_ruangan] = {
          id_ruangan: row.id_ruangan,
          nama_ruangan: row.nama_ruangan,
          kapasitas: row.kapasitas,
          status: row.status,
          id_lantai: row.id_lantai,
          nomor_lantai: row.nomor_lantai,
          id_gedung: row.id_gedung,
          nama_gedung: row.nama_gedung,
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
          pengguna: row.pengguna,
          deskripsi_kegiatan: row.deskripsi_kegiatan
        });
      }
    });

    res.json(Object.values(ruanganMap));
  } catch (error) {
    console.error("Error fetching ruangan with jadwal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Ambil ruangan untuk TV Device (public, filter by gedung & lantai)
const getRuanganWithJadwalTv = async (req, res) => {
  const { id_gedung, id_lantai } = req.query;

  if (!id_gedung || !id_lantai) {
    return res.status(400).json({ message: "id_gedung dan id_lantai wajib diisi" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT r.id_ruangan, r.nama_ruangan, r.kapasitas, r.status,
             l.id_lantai, l.nomor_lantai,
             g.id_gedung, g.nama_gedung,
             j.id_jadwal,
             DATE_FORMAT(j.tanggal, '%Y-%m-%d') AS tanggal,
             TIME_FORMAT(j.waktu_mulai, '%H:%i') AS waktu_mulai,
             TIME_FORMAT(j.waktu_selesai, '%H:%i') AS waktu_selesai,
             k.id_kegiatan, k.nama_kegiatan, k.pengguna, k.deskripsi_kegiatan
      FROM ruangan r
      JOIN lantai l ON r.id_lantai = l.id_lantai
      JOIN gedung g ON l.id_gedung = g.id_gedung
      LEFT JOIN kegiatan k ON r.id_ruangan = k.id_ruangan
      LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
       AND j.tanggal = CURDATE()
      WHERE g.id_gedung = ? AND l.id_lantai = ?
      ORDER BY r.nama_ruangan, j.waktu_mulai;
    `, [id_gedung, id_lantai]);

    const ruanganMap = {};

    rows.forEach(row => {
      if (!ruanganMap[row.id_ruangan]) {
        ruanganMap[row.id_ruangan] = {
          id_ruangan: row.id_ruangan,
          nama_ruangan: row.nama_ruangan,
          kapasitas: row.kapasitas,
          status: row.status,
          id_lantai: row.id_lantai,
          nomor_lantai: row.nomor_lantai,
          id_gedung: row.id_gedung,
          nama_gedung: row.nama_gedung,
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
          pengguna: row.pengguna,
          deskripsi_kegiatan: row.deskripsi_kegiatan
        });
      }
    });

    res.json(Object.values(ruanganMap));
  } catch (error) {
    console.error("Error fetching ruangan TV:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update ruangan
const updateRuangan = async (req, res) => {
  const { id } = req.params;
  const { id_lantai, nama_ruangan, kapasitas, status } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE ruangan SET id_lantai=?, nama_ruangan=?, kapasitas=?, status=? WHERE id_ruangan=?",
      [id_lantai, nama_ruangan, kapasitas, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });
    }

    res.json({ message: "Ruangan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating ruangan:", error);
    res.status(500).json({ message: "Gagal memperbarui ruangan", error });
  }
};

// Delete ruangan
const deleteRuangan = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM ruangan WHERE id_ruangan = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });
    }

    res.json({ message: "Ruangan berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting ruangan:", error);
    res.status(500).json({ message: "Gagal menghapus ruangan", error });
  }
};

module.exports = { 
  addRuangan, 
  getRuangans, 
  getRuanganWithJadwal, 
  getRuanganWithJadwalTv, // ✅ export baru
  updateRuangan, 
  deleteRuangan 
};