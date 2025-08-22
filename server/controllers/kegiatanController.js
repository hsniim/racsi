const pool = require('../config/db');

// Tambah kegiatan (sudah ada)
const addKegiatan = async (req, res) => {
  const { id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna } = req.body;
  if (!id_ruangan || !nama_kegiatan || !deskripsi_kegiatan || !pengguna) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO kegiatan (id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna) VALUES (?, ?, ?, ?)',
      [id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna]
    );
    res.status(201).json({ id_kegiatan: result.insertId, message: 'Kegiatan berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding kegiatan:', error);
    res.status(500).json({ message: 'Gagal menambahkan kegiatan', error });
  }
};

// Ambil semua kegiatan
const getKegiatans = async (req, res) => {
  try {
    // Join ruangan, lantai, gedung supaya frontend bisa menampilkan konteks kegiatan
    const [rows] = await pool.query(`
      SELECT k.id_kegiatan, k.nama_kegiatan, k.deskripsi_kegiatan, k.pengguna,
             r.nama_ruangan, l.nomor_lantai, g.nama_gedung
      FROM kegiatan k
      JOIN ruangan r ON k.id_ruangan = r.id_ruangan
      JOIN lantai l ON r.id_lantai = l.id_lantai
      JOIN gedung g ON l.id_gedung = g.id_gedung
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    res.status(500).json({ message: 'Gagal mengambil data kegiatan', error });
  }
};

module.exports = { addKegiatan, getKegiatans };
