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

    // Ambil info kegiatan beserta id_ruangan dan nama pengguna
    const [kegiatan] = await pool.query(
      'SELECT id_ruangan, pengguna FROM kegiatan WHERE id_kegiatan = ?',
      [id_kegiatan]
    );

    if (kegiatan.length === 0) {
      return res.status(400).json({ message: 'Kegiatan tidak ditemukan' });
    }

    const { id_ruangan, pengguna } = kegiatan[0];

    // Update status ruangan menjadi 'digunakan'
    await pool.query('UPDATE ruangan SET status = "digunakan" WHERE id_ruangan = ?', [id_ruangan]);

    res.status(201).json({ id_jadwal: result.insertId, message: 'Jadwal berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding jadwal:', error);
    res.status(500).json({ message: 'Gagal menambahkan jadwal', error });
  }
};

// Ambil semua jadwal beserta nama kegiatan dan migrasi jadwal yang sudah lewat ke histori
const getJadwals = async (req, res) => {
  try {
    // 1. Pindahkan jadwal yang sudah lewat ke riwayat
    const [expired] = await pool.query(
      `SELECT j.*, k.nama_kegiatan, k.pengguna, k.id_ruangan
       FROM jadwal j
       JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
       WHERE CONCAT(j.tanggal, ' ', j.waktu_selesai) < NOW()`
    );

    for (const jadwal of expired) {
      // Insert ke histori
      await pool.query(
        `INSERT INTO histori_kegiatan_jadwal 
         (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai, migrated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          jadwal.id_kegiatan,
          jadwal.id_jadwal,
          jadwal.nama_kegiatan,
          jadwal.pengguna,   // <-- pakai nama pengguna asli dari kegiatan
          jadwal.id_ruangan,
          jadwal.tanggal,
          jadwal.waktu_mulai,
          jadwal.waktu_selesai
        ]
      );

      // Hapus jadwal dari tabel jadwal
      await pool.query('DELETE FROM jadwal WHERE id_jadwal = ?', [jadwal.id_jadwal]);

      // Update status ruangan kembali ke "kosong"
      await pool.query('UPDATE ruangan SET status = "kosong" WHERE id_ruangan = ?', [jadwal.id_ruangan]);
    }

    // 2. Ambil jadwal yang masih aktif
    const [jadwals] = await pool.query(
      `SELECT j.id_jadwal, j.tanggal, j.waktu_mulai, j.waktu_selesai,
              k.nama_kegiatan, k.pengguna
       FROM jadwal j
       JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
       ORDER BY j.tanggal DESC, j.waktu_mulai ASC`
    );

    res.json({ data: jadwals });
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ message: 'Gagal mengambil data jadwal', error });
  }
};

module.exports = { addJadwal, getJadwals };
