const pool = require("../config/db");

// ➕ Tambah PJ Gedung
const addPjGedung = async (req, res) => {
  const { id_gedung, nama, no_telp, link_peminjaman, qrcodepath_pinjam, qrcodepath_kontak } = req.body;

  // Validasi field wajib
  if (!id_gedung || !nama || !no_telp) {
    return res.status(400).json({ message: "id_gedung, nama, dan no_telp wajib diisi" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO pj_gedung 
       (id_gedung, nama, no_telp, link_peminjaman, qrcodepath_pinjam, qrcodepath_kontak) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_gedung, nama, no_telp, link_peminjaman || "", qrcodepath_pinjam || "", qrcodepath_kontak || ""]
    );

    res.status(201).json({ id_pj_gedung: result.insertId, message: "PJ Gedung berhasil ditambahkan" });
  } catch (error) {
    console.error("Error adding PJ:", error);
    res.status(500).json({ message: "Gagal menambahkan PJ Gedung", error: error.message });
  }
};

// 🔹 Ambil semua PJ + info Gedung
const getAllPjGedung = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pj.id_pj_gedung, pj.nama, pj.no_telp, pj.link_peminjaman,
             pj.qrcodepath_pinjam, pj.qrcodepath_kontak,
             g.id_gedung, g.nama_gedung, g.lokasi_gedung
      FROM pj_gedung pj
      LEFT JOIN gedung g ON pj.id_gedung = g.id_gedung
      ORDER BY pj.id_pj_gedung DESC
    `);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error("Error fetching PJ:", error);
    res.status(500).json({ message: "Gagal mengambil data PJ Gedung", error: error.message });
  }
};

// 🔄 Update PJ Gedung
const updatePjGedung = async (req, res) => {
  const { id } = req.params;
  const { id_gedung, nama, no_telp, link_peminjaman, qrcodepath_pinjam, qrcodepath_kontak } = req.body;

  if (!id_gedung || !nama || !no_telp) {
    return res.status(400).json({ message: "id_gedung, nama, dan no_telp wajib diisi" });
  }

  try {
    await pool.query(
      `UPDATE pj_gedung 
       SET id_gedung=?, nama=?, no_telp=?, link_peminjaman=?, qrcodepath_pinjam=?, qrcodepath_kontak=?
       WHERE id_pj_gedung=?`,
      [id_gedung, nama, no_telp, link_peminjaman || "", qrcodepath_pinjam || "", qrcodepath_kontak || "", id]
    );

    res.status(200).json({ message: "PJ Gedung berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating PJ:", error);
    res.status(500).json({ message: "Gagal memperbarui PJ Gedung", error: error.message });
  }
};

// ❌ Hapus PJ Gedung
const deletePjGedung = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pj_gedung WHERE id_pj_gedung=?", [id]);
    res.status(200).json({ message: "PJ Gedung berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting PJ:", error);
    res.status(500).json({ message: "Gagal menghapus PJ Gedung", error: error.message });
  }
};

module.exports = { addPjGedung, getAllPjGedung, updatePjGedung, deletePjGedung };
