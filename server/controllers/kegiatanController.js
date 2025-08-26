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

// Ambil semua kegiatan (hapus otomatis kalau jadwal berakhir)
const getKegiatans = async (req, res) => {
  try {
    // 1. Hapus kegiatan yang jadwalnya sudah selesai (end time < NOW)
    await pool.query(`
      DELETE k FROM kegiatan k
      INNER JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
      WHERE TIMESTAMP(j.tanggal, j.waktu_selesai) < NOW()
    `);

    // 2. Ambil data kegiatan yang masih aktif (atau belum ada jadwal)
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

// Update kegiatan
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

// Hapus kegiatan
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
