const pool = require('../config/db');

// Tambah kegiatan
const addKegiatan = async (req, res) => {
  const { id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna } = req.body;
  if (!id_ruangan || !nama_kegiatan || !deskripsi_kegiatan || !pengguna) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO kegiatan (id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna) VALUES (?, ?, ?, ?)',
      [id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna]
    );
    res.status(201).json({ id_kegiatan: result.insertId, message: 'Kegiatan berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding kegiatan:', error);
    res.status(500).json({ message: 'Gagal menambahkan kegiatan', error });
  }
};

// Ambil semua kegiatan (hapus otomatis kalau jadwal berakhir & pindahkan ke histori)
const getKegiatans = async (req, res) => {
  try {
    // 1. Migrasi kegiatan yang sudah selesai ke histori
    const [expired] = await pool.query(`
      SELECT k.id_kegiatan, j.id_jadwal, k.nama_kegiatan, k.pengguna, k.id_ruangan, j.tanggal, j.waktu_mulai, j.waktu_selesai
      FROM kegiatan k
      JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
      WHERE TIMESTAMP(j.tanggal, j.waktu_selesai) < NOW()
    `);

    for (const k of expired) {
      await pool.query(`
        INSERT INTO histori_kegiatan_jadwal
        (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai, migrated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [k.id_kegiatan, k.id_jadwal, k.nama_kegiatan, k.pengguna, k.id_ruangan, k.tanggal, k.waktu_mulai, k.waktu_selesai]);

      await pool.query('DELETE FROM kegiatan WHERE id_kegiatan = ?', [k.id_kegiatan]);
    }

    // 2. Ambil kegiatan yang masih aktif
    const [rows] = await pool.query(`
      SELECT 
        k.id_kegiatan,
        k.nama_kegiatan,
        k.deskripsi_kegiatan,
        k.pengguna,
        r.nama_ruangan,
        l.nomor_lantai,
        g.nama_gedung,
        j.id_jadwal,
        j.tanggal,
        j.waktu_mulai,
        j.waktu_selesai
      FROM kegiatan k
      LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan 
        AND TIMESTAMP(j.tanggal, j.waktu_selesai) >= NOW()
      LEFT JOIN ruangan r ON k.id_ruangan = r.id_ruangan
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      ORDER BY j.tanggal ASC, j.waktu_mulai ASC
    `);

    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    res.status(500).json({ message: 'Gagal mengambil data kegiatan', error });
  }
};

const updateKegiatan = async (req, res) => {
  const { id } = req.params;
  const { id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna } = req.body;
  if (!id_ruangan || !nama_kegiatan || !deskripsi_kegiatan || !pengguna) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    await pool.query(
      'UPDATE kegiatan SET id_ruangan=?, nama_kegiatan=?, deskripsi_kegiatan=?, pengguna=? WHERE id_kegiatan=?',
      [id_ruangan, nama_kegiatan, deskripsi_kegiatan, pengguna, id]
    );
    res.json({ message: 'Kegiatan berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating kegiatan:', error);
    res.status(500).json({ message: 'Gagal memperbarui kegiatan', error });
  }
};

const deleteKegiatan = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kegiatan WHERE id_kegiatan=?', [id]);
    res.json({ message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kegiatan:', error);
    res.status(500).json({ message: 'Gagal menghapus kegiatan', error });
  }
};

module.exports = { addKegiatan, getKegiatans, updateKegiatan, deleteKegiatan };
