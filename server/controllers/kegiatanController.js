const pool = require('../config/db');

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

module.exports = { addKegiatan };