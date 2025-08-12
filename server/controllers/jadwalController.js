const pool = require('../config/db');

const addJadwal = async (req, res) => {
  const { id_kegiatan, tanggal, waktu_mulai, waktu_selesai } = req.body;
  if (!id_kegiatan || !tanggal || !waktu_mulai || !waktu_selesai) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }
  try {
    // Insert jadwal tanpa id_ruangan
    const [result] = await pool.query(
      'INSERT INTO jadwal (id_kegiatan, tanggal, waktu_mulai, waktu_selesai) VALUES (?, ?, ?, ?)',
      [id_kegiatan, tanggal, waktu_mulai, waktu_selesai]
    );

    // Ambil id_ruangan dari tabel kegiatan berdasarkan id_kegiatan
    const [kegiatan] = await pool.query(
      'SELECT id_ruangan FROM kegiatan WHERE id_kegiatan = ?',
      [id_kegiatan]
    );
    if (kegiatan.length === 0) {
      return res.status(400).json({ message: 'Kegiatan tidak ditemukan' });
    }
    const id_ruangan = kegiatan[0].id_ruangan;

    // Update status ruangan menjadi 'digunakan'
    await pool.query('UPDATE ruangan SET status = "digunakan" WHERE id_ruangan = ?', [id_ruangan]);

    res.status(201).json({ id_jadwal: result.insertId, message: 'Jadwal berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding jadwal:', error);
    res.status(500).json({ message: 'Gagal menambahkan jadwal', error });
  }
};

module.exports = { addJadwal };