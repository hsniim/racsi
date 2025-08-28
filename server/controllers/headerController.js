const pool = require('../config/db');

// Ambil data header untuk display TV
const getHeaderData = async (req, res) => {
  try {
    // Query untuk ambil data gedung dan lantai yang aktif
    // Untuk sekarang, ambil gedung pertama dan lantai pertama sebagai default
    // Nanti bisa diperbaiki dengan sistem pemilihan gedung/lantai
    const [headerData] = await pool.query(`
      SELECT 
        g.nama_gedung,
        l.nomor_lantai,
        pj_pagi.nama as pj_lantaipagi,
        pj_siang.nama as pj_lantaisiang
      FROM gedung g
      JOIN lantai l ON g.id_gedung = l.id_gedung
      LEFT JOIN pj_lantai pj_pagi ON l.id_lantai = pj_pagi.id_lantai AND pj_pagi.shift = 'pagi'
      LEFT JOIN pj_lantai pj_siang ON l.id_lantai = pj_siang.id_lantai AND pj_siang.shift = 'siang'
      ORDER BY g.id_gedung ASC, l.nomor_lantai ASC
      LIMIT 1
    `);

    if (headerData.length === 0) {
      return res.status(404).json({ 
        message: 'Tidak ada data gedung dan lantai yang tersedia' 
      });
    }

    res.status(200).json({
      data: {
        nama_gedung: headerData[0].nama_gedung,
        nomor_lantai: headerData[0].nomor_lantai,
        pj_lantaipagi: headerData[0].pj_lantaipagi || 'Belum ditentukan',
        pj_lantaisiang: headerData[0].pj_lantaisiang || 'Belum ditentukan'
      }
    });

  } catch (error) {
    console.error('Error fetching header data:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data header', 
      error: error.message 
    });
  }
};

// Alternative: Ambil berdasarkan ID gedung dan lantai spesifik
const getHeaderDataByIds = async (req, res) => {
  const { id_gedung, id_lantai } = req.params;
  
  try {
    const [headerData] = await pool.query(`
      SELECT 
        g.nama_gedung,
        l.nomor_lantai,
        pj_pagi.nama as pj_lantaipagi,
        pj_siang.nama as pj_lantaisiang
      FROM gedung g
      JOIN lantai l ON g.id_gedung = l.id_gedung
      LEFT JOIN pj_lantai pj_pagi ON l.id_lantai = pj_pagi.id_lantai AND pj_pagi.shift = 'pagi'
      LEFT JOIN pj_lantai pj_siang ON l.id_lantai = pj_siang.id_lantai AND pj_siang.shift = 'siang'
      WHERE g.id_gedung = ? AND l.id_lantai = ?
    `, [id_gedung, id_lantai]);

    if (headerData.length === 0) {
      return res.status(404).json({ 
        message: 'Data gedung dan lantai tidak ditemukan' 
      });
    }

    res.status(200).json({
      data: {
        nama_gedung: headerData[0].nama_gedung,
        nomor_lantai: headerData[0].nomor_lantai,
        pj_lantaipagi: headerData[0].pj_lantaipagi || 'Belum ditentukan',
        pj_lantaisiang: headerData[0].pj_lantaisiang || 'Belum ditentukan'
      }
    });

  } catch (error) {
    console.error('Error fetching specific header data:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data header spesifik', 
      error: error.message 
    });
  }
};

module.exports = {
  getHeaderData,
  getHeaderDataByIds
};
