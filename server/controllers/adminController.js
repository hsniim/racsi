const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysqldump = require('mysqldump');
const path = require('path');
const fs = require('fs');
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

const getGedungLantaiList = async (req, res) => {
  try {
    const query = `
      SELECT 
        g.id_gedung,
        g.nama_gedung,
        g.lokasi_gedung,
        l.id_lantai,
        l.nomor_lantai,
        COUNT(r.id_ruangan) as total_ruangan,
        GROUP_CONCAT(
          CASE 
            WHEN pjl_pagi.nama IS NOT NULL 
            THEN CONCAT(pjl_pagi.nama, ' (Pagi)')
          END
          SEPARATOR ', '
        ) as pj_lantai_pagi,
        GROUP_CONCAT(
          CASE 
            WHEN pjl_siang.nama IS NOT NULL 
            THEN CONCAT(pjl_siang.nama, ' (Siang)')
          END
          SEPARATOR ', '
        ) as pj_lantai_siang
      FROM gedung g
      LEFT JOIN lantai l ON g.id_gedung = l.id_gedung
      LEFT JOIN ruangan r ON l.id_lantai = r.id_lantai
      LEFT JOIN pj_lantai pjl_pagi ON l.id_lantai = pjl_pagi.id_lantai AND pjl_pagi.shift = 'pagi'
      LEFT JOIN pj_lantai pjl_siang ON l.id_lantai = pjl_siang.id_lantai AND pjl_siang.shift = 'siang'
      WHERE l.id_lantai IS NOT NULL
      GROUP BY g.id_gedung, l.id_lantai, g.nama_gedung, g.lokasi_gedung, l.nomor_lantai
      ORDER BY g.nama_gedung ASC, l.nomor_lantai ASC
    `;

    const [rows] = await pool.query(query);
    
    const formattedRows = rows.map(row => ({
      id_gedung: row.id_gedung,
      id_lantai: row.id_lantai,
      nama_gedung: row.nama_gedung,
      lokasi_gedung: row.lokasi_gedung,
      nomor_lantai: row.nomor_lantai,
      total_ruangan: parseInt(row.total_ruangan) || 0,
      pj_lantai: [
        row.pj_lantai_pagi,
        row.pj_lantai_siang
      ].filter(Boolean).join(', ') || 'Belum ada PJ'
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching gedung lantai list:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data gedung dan lantai',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Backup Database Utama
const backupMainDatabase = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `racsi_main_backup_${timestamp}.sql`;
    const backupDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupDir, filename);

    // Pastikan folder backups ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Konfigurasi dump dengan kredensial dari .env
    const dumpOptions = {
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'db_racsi', // Database utama
      },
      dumpToFile: filepath,
      compressFile: false,
    };

    console.log('Starting main database backup...');
    await mysqldump(dumpOptions);
    console.log('Main database backup completed');

    // Set headers untuk download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filepath).size);
    
    // Stream file ke response
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Hapus file setelah dikirim
    fileStream.on('end', () => {
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log('Backup file cleaned up');
        }
      }, 1000);
    });

    fileStream.on('error', (error) => {
      console.error('Error streaming backup file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading backup file' });
      }
    });

  } catch (error) {
    console.error('Backup main database error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Gagal membuat backup database utama',
        error: error.message 
      });
    }
  }
};

// Backup Database Arsip
const backupArchiveDatabase = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `racsi_archive_backup_${timestamp}.sql`;
    const backupDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupDir, filename);

    // Pastikan folder backups ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Konfigurasi dump dengan kredensial dari .env
    const dumpOptions = {
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'db_racsi_arsip', // Database arsip
      },
      dumpToFile: filepath,
      compressFile: false,
    };

    console.log('Starting archive database backup...');
    await mysqldump(dumpOptions);
    console.log('Archive database backup completed');

    // Set headers untuk download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filepath).size);
    
    // Stream file ke response
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Hapus file setelah dikirim
    fileStream.on('end', () => {
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log('Archive backup file cleaned up');
        }
      }, 1000);
    });

    fileStream.on('error', (error) => {
      console.error('Error streaming archive backup file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading backup file' });
      }
    });

  } catch (error) {
    console.error('Backup archive database error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Gagal membuat backup database arsip',
        error: error.message 
      });
    }
  }
};

module.exports = {
  loginAdmin,
  getDashboardStats,
  getGedungLantaiList,
  backupMainDatabase,
  backupArchiveDatabase
};