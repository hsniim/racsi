const pool = require('../config/db');

// Tambah gedung
const createGedung = async (req, res) => {
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

// Ambil semua gedung
const getAllGedung = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gedung');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data gedung', error: err });
  }
};

// Update gedung
const updateGedung = async (req, res) => {
  const { id } = req.params;
  const { nama_gedung, lokasi_gedung, pj_gedung } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE gedung SET nama_gedung = ?, lokasi_gedung = ?, pj_gedung = ? WHERE id_gedung = ?',
      [nama_gedung, lokasi_gedung, pj_gedung, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gedung tidak ditemukan' });
    }
    res.json({ message: 'Gedung berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengupdate gedung', error: err });
  }
};

// Delete gedung
const deleteGedung = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM gedung WHERE id_gedung = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gedung tidak ditemukan' });
    }
    res.json({ message: 'Gedung berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus gedung', error: err });
  }
};

module.exports = {
  createGedung,
  getAllGedung,
  updateGedung,
  deleteGedung,
};