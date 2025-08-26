const pool = require('../config/db');

// Tambah jadwal
const addJadwal = async (req, res) => {
  const { id_kegiatan, tanggal, waktu_mulai, waktu_selesai } = req.body;
  if (!id_kegiatan || !tanggal || !waktu_mulai || !waktu_selesai) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Insert jadwal baru
    const [result] = await pool.query(
      'INSERT INTO jadwal (id_kegiatan, tanggal, waktu_mulai, waktu_selesai) VALUES (?, ?, ?, ?)',
      [id_kegiatan, tanggal, waktu_mulai, waktu_selesai]
    );

    // Ambil info kegiatan beserta id_ruangan
    const [kegiatan] = await pool.query(
      'SELECT id_ruangan, pengguna FROM kegiatan WHERE id_kegiatan = ?',
      [id_kegiatan]
    );

    if (kegiatan.length === 0) {
      return res.status(400).json({ message: 'Kegiatan tidak ditemukan' });
    }

    const { id_ruangan } = kegiatan[0];

    // Update status ruangan menjadi 'digunakan'
    await pool.query('UPDATE ruangan SET status = "digunakan" WHERE id_ruangan = ?', [id_ruangan]);

    res.status(201).json({ id_jadwal: result.insertId, message: 'Jadwal berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding jadwal:', error);
    res.status(500).json({ message: 'Gagal menambahkan jadwal', error });
  }
};

// Ambil semua jadwal (aktif + migrasi yang lewat ke histori)
const getJadwals = async (req, res) => {
  try {
    // 1. Pindahkan jadwal yang sudah lewat ke histori
    const [expired] = await pool.query(
      `SELECT j.*, k.nama_kegiatan, k.pengguna, k.id_ruangan
       FROM jadwal j
       JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
       WHERE TIMESTAMP(j.tanggal, j.waktu_selesai) < NOW() - INTERVAL 5 MINUTE`
    );

    for (const jadwal of expired) {
      await pool.query(
        `INSERT INTO histori_kegiatan_jadwal 
         (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai, migrated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          jadwal.id_kegiatan,
          jadwal.id_jadwal,
          jadwal.nama_kegiatan,
          jadwal.pengguna,
          jadwal.id_ruangan,
          jadwal.tanggal,
          jadwal.waktu_mulai,
          jadwal.waktu_selesai
        ]
      );

      await pool.query('DELETE FROM jadwal WHERE id_jadwal = ?', [jadwal.id_jadwal]);
      await pool.query('UPDATE ruangan SET status = "kosong" WHERE id_ruangan = ?', [jadwal.id_ruangan]);
    }

    // 2. Ambil jadwal yang masih aktif
    const [jadwals] = await pool.query(
      `SELECT j.id_jadwal, j.tanggal, j.waktu_mulai, j.waktu_selesai,
              k.nama_kegiatan, k.pengguna, r.nama_ruangan
       FROM jadwal j
       JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
       JOIN ruangan r ON k.id_ruangan = r.id_ruangan
       WHERE TIMESTAMP(j.tanggal, j.waktu_selesai) >= NOW()
       ORDER BY j.tanggal ASC, j.waktu_mulai ASC`
    );

    res.json({ data: jadwals });
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ message: 'Gagal mengambil data jadwal', error });
  }
};

// Update jadwal
const updateJadwal = async (req, res) => {
  const { id } = req.params;
  const { id_kegiatan, tanggal, waktu_mulai, waktu_selesai } = req.body;

  if (!id_kegiatan || !tanggal || !waktu_mulai || !waktu_selesai) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE jadwal 
       SET id_kegiatan = ?, tanggal = ?, waktu_mulai = ?, waktu_selesai = ?
       WHERE id_jadwal = ?`,
      [id_kegiatan, tanggal, waktu_mulai, waktu_selesai, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating jadwal:", error);
    res.status(500).json({ message: "Gagal mengupdate jadwal", error });
  }
};

// Delete jadwal
const deleteJadwal = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT id_ruangan FROM kegiatan k JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan WHERE j.id_jadwal = ?",
      [id]
    );

    if (rows.length > 0) {
      await pool.query("UPDATE ruangan SET status = 'kosong' WHERE id_ruangan = ?", [rows[0].id_ruangan]);
    }

    const [result] = await pool.query("DELETE FROM jadwal WHERE id_jadwal = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting jadwal:", error);
    res.status(500).json({ message: "Gagal menghapus jadwal", error });
  }
};

module.exports = { addJadwal, getJadwals, updateJadwal, deleteJadwal };
