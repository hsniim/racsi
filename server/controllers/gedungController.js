const pool = require('../config/db');

// Tambah gedung baru
const addGedung = async (req, res) => {
  const { nama_gedung, lokasi_gedung } = req.body;

  if (!nama_gedung || !lokasi_gedung) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO gedung (nama_gedung, lokasi_gedung) VALUES (?, ?)`,
      [nama_gedung, lokasi_gedung]
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
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error fetching gedung:', error);
    res.status(500).json({ message: 'Gagal mengambil data gedung', error });
  }
};

// Update gedung
const updateGedung = async (req, res) => {
  const { id } = req.params;
  const { nama_gedung, lokasi_gedung } = req.body;

  if (!nama_gedung || !lokasi_gedung) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    await pool.query(
      `UPDATE gedung SET nama_gedung = ?, lokasi_gedung = ? WHERE id_gedung = ?`,
      [nama_gedung, lokasi_gedung, id]
    );
    res.status(200).json({ message: "Gedung berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating gedung:", error);
    res.status(500).json({ message: "Gagal memperbarui gedung", error });
  }
};

// Delete gedung
const deleteGedung = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM gedung WHERE id_gedung = ?`, [id]);
    res.status(200).json({ message: "Gedung berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting gedung:", error);
    res.status(500).json({ message: "Gagal menghapus gedung", error });
  }
};

module.exports = { addGedung, getAllGedung, updateGedung, deleteGedung };
