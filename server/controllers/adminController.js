const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Login admin
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Username salah' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign({ id: user.id_admin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error login', error });
  }
};

// Ambil statistik dashboard + updates realtime
const getDashboardStats = async (req, res) => {
  try {
    // Statistik
    const [gedung] = await pool.query("SELECT COUNT(*) AS totalGedung FROM gedung");
    const [lantai] = await pool.query("SELECT COUNT(*) AS totalLantai FROM lantai");
    const [ruangan] = await pool.query("SELECT COUNT(*) AS totalRuangan FROM ruangan");

    // Updates: hanya ambil jadwal yang masih aktif (waktu selesai >= sekarang)
    const [updates] = await pool.query(`
      SELECT 
        g.nama_gedung AS gedung,
        l.nomor_lantai AS lantai,
        r.nama_ruangan AS nama,
        k.nama_kegiatan AS kegiatan,
        CONCAT(j.tanggal, ' ', j.waktu_mulai, '-', j.waktu_selesai) AS jadwal
      FROM jadwal j
      JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
      JOIN ruangan r ON k.id_ruangan = r.id_ruangan
      JOIN lantai l ON r.id_lantai = l.id_lantai
      JOIN gedung g ON l.id_gedung = g.id_gedung
      WHERE CONCAT(j.tanggal, ' ', j.waktu_selesai) >= NOW()
      ORDER BY j.tanggal ASC, j.waktu_mulai ASC
    `);

    res.json({
      totalGedung: gedung[0].totalGedung,
      totalLantai: lantai[0].totalLantai,
      totalRuangan: ruangan[0].totalRuangan,
      rooms: updates
    });
  } catch (err) {
    res.status(500).json({ message: "Error mengambil data dashboard", error: err });
  }
};

module.exports = { loginAdmin, getDashboardStats };
