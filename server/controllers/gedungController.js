const pool = require('../config/db');

const addGedung = async (req, res) => {
  const { nama_gedung, lokasi_gedung, pj_gedung } = req.body;
  if (!nama_gedung || !lokasi_gedung || !pj_gedung) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO gedung (nama_gedung, lokasi_gedung, pj_gedung) VALUES (?, ?, ?)',
      [nama_gedung, lokasi_gedung, pj_gedung]
    );
    res.status(201).json({ id_gedung: result.insertId, message: 'Gedung berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding gedung:', error);
    res.status(500).json({ message: 'Gagal menambahkan gedung', error });
  }
};

module.exports = { addGedung };