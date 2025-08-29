const pool = require("../config/db");

// Ambil semua PJ Lantai
const getPJLantai = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pj_lantai.id_pj_lantai, pj_lantai.shift, pj_lantai.nama, pj_lantai.created_at,
             lantai.id_lantai, lantai.nomor_lantai, gedung.nama_gedung
      FROM pj_lantai
      JOIN lantai ON pj_lantai.id_lantai = lantai.id_lantai
      JOIN gedung ON lantai.id_gedung = gedung.id_gedung
      ORDER BY pj_lantai.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data PJ Lantai" });
  }
};

// Tambah PJ Lantai
const addPJLantai = async (req, res) => {
  const { id_lantai, shift, nama } = req.body;
  if (!id_lantai || !shift || !nama) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }
  try {
    await pool.query(
      "INSERT INTO pj_lantai (id_lantai, shift, nama) VALUES (?, ?, ?)",
      [id_lantai, shift, nama]
    );
    res.json({ message: "PJ Lantai berhasil ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan PJ Lantai" });
  }
};

// Update PJ Lantai
const updatePJLantai = async (req, res) => {
  const { id } = req.params;
  const { id_lantai, shift, nama } = req.body;
  try {
    await pool.query(
      "UPDATE pj_lantai SET id_lantai=?, shift=?, nama=? WHERE id_pj_lantai=?",
      [id_lantai, shift, nama, id]
    );
    res.json({ message: "PJ Lantai berhasil diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui PJ Lantai" });
  }
};

// Hapus PJ Lantai
const deletePJLantai = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pj_lantai WHERE id_pj_lantai=?", [id]);
    res.json({ message: "PJ Lantai berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus PJ Lantai" });
  }
};

module.exports = {
  getPJLantai,
  addPJLantai,
  updatePJLantai,
  deletePJLantai,
};
