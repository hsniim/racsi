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

module.exports = { addRuangan };