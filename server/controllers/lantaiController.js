const pool = require('../config/db');

const addLantai = async (req, res) => {
  const { id_gedung, nomor_lantai, pj_lantaipagi, pj_lantaisiang } = req.body;
  if (!id_gedung || !nomor_lantai || !pj_lantaipagi || !pj_lantaisiang) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO lantai (id_gedung, nomor_lantai, pj_lantaipagi, pj_lantaisiang) VALUES (?, ?, ?, ?)',
      [id_gedung, nomor_lantai, pj_lantaipagi, pj_lantaisiang]
    );
    res.status(201).json({ id_lantai: result.insertId, message: 'Lantai berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding lantai:', error);
    res.status(500).json({ message: 'Gagal menambahkan lantai', error });
  }
};

// Ambil semua lantai
const getLantai = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, g.nama_gedung 
       FROM lantai l 
       JOIN gedung g ON l.id_gedung = g.id_gedung`
    );
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching lantai:', error);
    res.status(500).json({ message: 'Gagal mengambil data lantai', error });
  }
};

module.exports = { addLantai, getLantai };