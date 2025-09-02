const pool = require('../config/db');

// Tambah lantai baru
const addLantai = async (req, res) => {
  const { id_gedung, nomor_lantai } = req.body;
  if (!id_gedung || !nomor_lantai) {
    return res.status(400).json({ message: 'id_gedung dan nomor_lantai wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO lantai (id_gedung, nomor_lantai) VALUES (?, ?)',
      [id_gedung, nomor_lantai]
    );
    res.status(201).json({ id_lantai: result.insertId, message: 'Lantai berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding lantai:', error);
    res.status(500).json({ message: 'Gagal menambahkan lantai', error });
  }
};

// Ambil semua lantai - PERBAIKAN: tambah nama_lantai computed dan return semua lantai
const getLantai = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, 
              g.nama_gedung,
              CONCAT('Lantai ', l.nomor_lantai) as nama_lantai
       FROM lantai l 
       JOIN gedung g ON l.id_gedung = g.id_gedung
       ORDER BY g.nama_gedung, l.nomor_lantai`
    );
    
    console.log('Lantai query result:', rows); // Debug log
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching lantai:', error);
    res.status(500).json({ message: 'Gagal mengambil data lantai', error });
  }
};

// TAMBAHAN: Endpoint khusus untuk ambil lantai berdasarkan gedung
const getLantaiByGedung = async (req, res) => {
  const { id_gedung } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT l.*, 
              g.nama_gedung,
              CONCAT('Lantai ', l.nomor_lantai) as nama_lantai
       FROM lantai l 
       JOIN gedung g ON l.id_gedung = g.id_gedung
       WHERE l.id_gedung = ?
       ORDER BY l.nomor_lantai`,
      [id_gedung]
    );
    
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching lantai by gedung:', error);
    res.status(500).json({ message: 'Gagal mengambil data lantai', error });
  }
};

// Update lantai
const updateLantai = async (req, res) => {
  const { id } = req.params;
  const { id_gedung, nomor_lantai } = req.body;

  if (!id_gedung || !nomor_lantai) {
    return res.status(400).json({ message: 'id_gedung dan nomor_lantai wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE lantai SET id_gedung = ?, nomor_lantai = ? WHERE id_lantai = ?',
      [id_gedung, nomor_lantai, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lantai tidak ditemukan' });
    }

    res.json({ message: 'Lantai berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating lantai:', error);
    res.status(500).json({ message: 'Gagal memperbarui lantai', error });
  }
};

// Hapus lantai
const deleteLantai = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM lantai WHERE id_lantai = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lantai tidak ditemukan' });
    }

    res.json({ message: 'Lantai berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting lantai:', error);
    res.status(500).json({ message: 'Gagal menghapus lantai', error });
  }
};

module.exports = { addLantai, getLantai, getLantaiByGedung, updateLantai, deleteLantai };