// server/controllers/feedbackController.js
const pool = require('../config/db');

const feedbackController = {
  // Tambah feedback baru
  async createFeedback(req, res) {
    const connection = await pool.getConnection();
    try {
      const { 
        id_ruangan, 
        nama_pengguna, 
        email_pengguna, 
        rating, 
        komentar, 
        kategori 
      } = req.body;

      // Validasi input
      if (!id_ruangan || !nama_pengguna || rating === undefined || rating === null) {
        return res.status(400).json({ 
          message: 'ID ruangan, nama pengguna, dan rating wajib diisi' 
        });
      }

      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'Rating harus antara 1-5' 
        });
      }

      // Validasi kategori sesuai ENUM di database
      const validKategori = ['fasilitas', 'kebersihan', 'kenyamanan', 'pelayanan', 'lainnya'];
      const kategoriToUse = validKategori.includes(kategori) ? kategori : 'lainnya';

      const now = new Date();
      const tanggal_feedback = now.toISOString().split('T')[0];

      const query = `
        INSERT INTO feedback_ruangan 
        (id_ruangan, nama_pengguna, email_pengguna, rating, komentar, kategori, tanggal_feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        id_ruangan,
        nama_pengguna,
        email_pengguna || null,
        rating,
        komentar || null,
        kategoriToUse,
        tanggal_feedback
      ]);

      res.status(201).json({ 
        message: 'Feedback berhasil disimpan',
        data: { id_feedback: result.insertId }
      });

    } catch (error) {
      console.error('Error creating feedback:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'ID ruangan atau jadwal tidak valid' });
      }
      res.status(500).json({ message: 'Gagal menyimpan feedback' });
    } finally {
      connection.release();
    }
  },

  // Ambil feedback untuk display di TV (rata-rata rating + feedback terbaru)
  async getFeedbackSummary(req, res) {
    const connection = await pool.getConnection();
    try {
      const { id_gedung, id_lantai } = req.query;

      if (!id_gedung || !id_lantai) {
        return res.status(400).json({ 
          message: 'ID gedung dan ID lantai wajib diisi' 
        });
      }

      const query = `
        SELECT 
          r.id_ruangan,
          r.nama_ruangan,
          COUNT(f.id_feedback) as total_feedback,
          ROUND(AVG(f.rating), 1) as rata_rating,
          MAX(f.created_at) as feedback_terakhir
        FROM ruangan r
        JOIN lantai l ON r.id_lantai = l.id_lantai
        LEFT JOIN feedback_ruangan f ON r.id_ruangan = f.id_ruangan
        WHERE l.id_gedung = ? AND l.id_lantai = ?
        GROUP BY r.id_ruangan, r.nama_ruangan
        HAVING total_feedback > 0
        ORDER BY rata_rating DESC, feedback_terakhir DESC
        LIMIT 5
      `;

      const [rows] = await connection.execute(query, [id_gedung, id_lantai]);

      // Ambil beberapa komentar terbaru untuk rotasi
      const komentarQuery = `
        SELECT 
          f.nama_pengguna,
          f.rating,
          f.komentar,
          f.kategori,
          r.nama_ruangan,
          DATE_FORMAT(f.created_at, '%d %b') as tanggal_singkat
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        WHERE l.id_gedung = ? AND l.id_lantai = ?
          AND f.komentar IS NOT NULL 
          AND f.komentar != ''
        ORDER BY f.created_at DESC
        LIMIT 10
      `;

      const [komentar] = await connection.execute(komentarQuery, [id_gedung, id_lantai]);

      res.json({
        summary: rows,
        recent_comments: komentar
      });

    } catch (error) {
      console.error('Error fetching feedback summary:', error);
      res.status(500).json({ message: 'Gagal mengambil ringkasan feedback' });
    } finally {
      connection.release();
    }
  },

  // Ambil detail feedback ruangan tertentu (untuk admin)
  async getFeedbackByRuangan(req, res) {
    const connection = await pool.getConnection();
    try {
      const { id_ruangan } = req.params;
      const { page = 1, limit = 10, kategori } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE f.id_ruangan = ?';
      let params = [id_ruangan];

      // Validasi kategori jika ada
      if (kategori) {
        const validKategori = ['fasilitas', 'kebersihan', 'kenyamanan', 'pelayanan', 'lainnya'];
        if (validKategori.includes(kategori)) {
          whereClause += ' AND f.kategori = ?';
          params.push(kategori);
        }
      }

      const query = `
        SELECT 
          f.id_feedback,
          f.id_ruangan,
          f.nama_pengguna,
          f.email_pengguna,
          f.rating,
          f.komentar,
          f.kategori,
          f.tanggal_feedback,
          f.created_at,
          r.nama_ruangan,
          DATE_FORMAT(f.created_at, '%d %b %Y %H:%i') as waktu_formatted,
          DATE_FORMAT(f.tanggal_feedback, '%d %b %Y') as tanggal_formatted
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), parseInt(offset));
      const [rows] = await connection.execute(query, params);

      // Hitung total untuk pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM feedback_ruangan f
        ${whereClause}
      `;
      const [countResult] = await connection.execute(countQuery, params.slice(0, -2));

      res.json({
        data: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching feedback by ruangan:', error);
      res.status(500).json({ message: 'Gagal mengambil feedback ruangan' });
    } finally {
      connection.release();
    }
  },

  // Ambil feedback berdasarkan gedung (untuk admin)
  async getFeedbackByGedung(req, res) {
    const connection = await pool.getConnection();
    try {
      const { id_gedung } = req.params;
      const { page = 1, limit = 20, kategori, rating_min, periode = '30' } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE l.id_gedung = ?';
      let params = [id_gedung];

      if (kategori) {
        const validKategori = ['fasilitas', 'kebersihan', 'kenyamanan', 'pelayanan', 'lainnya'];
        if (validKategori.includes(kategori)) {
          whereClause += ' AND f.kategori = ?';
          params.push(kategori);
        }
      }

      if (rating_min) {
        whereClause += ' AND f.rating >= ?';
        params.push(parseInt(rating_min));
      }

      if (periode) {
        whereClause += ' AND f.tanggal_feedback >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
        params.push(parseInt(periode));
      }

      const query = `
        SELECT 
          f.id_feedback,
          f.nama_pengguna,
          f.rating,
          f.komentar,
          f.kategori,
          f.tanggal_feedback,
          f.created_at,
          r.nama_ruangan,
          l.nomor_lantai,
          g.nama_gedung,
          DATE_FORMAT(f.created_at, '%d %b %Y %H:%i') as waktu_formatted
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        JOIN gedung g ON l.id_gedung = g.id_gedung
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), parseInt(offset));
      const [rows] = await connection.execute(query, params);

      // Hitung total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        ${whereClause}
      `;
      const [countResult] = await connection.execute(countQuery, params.slice(0, -2));

      res.json({
        data: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching feedback by gedung:', error);
      res.status(500).json({ message: 'Gagal mengambil feedback gedung' });
    } finally {
      connection.release();
    }
  },

  // Statistik feedback untuk dashboard admin
  async getFeedbackStats(req, res) {
    const connection = await pool.getConnection();
    try {
      const { periode = '30', id_gedung } = req.query;

      let whereClause = 'WHERE f.tanggal_feedback >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
      let params = [parseInt(periode)];

      if (id_gedung) {
        whereClause += ' AND l.id_gedung = ?';
        params.push(id_gedung);
      }

      // Statistik umum
      const statsQuery = `
        SELECT 
          COUNT(*) as total_feedback,
          ROUND(AVG(f.rating), 2) as rata_rating_keseluruhan,
          COUNT(CASE WHEN f.rating >= 4 THEN 1 END) as feedback_positif,
          COUNT(CASE WHEN f.rating <= 2 THEN 1 END) as feedback_negatif,
          COUNT(CASE WHEN f.rating = 3 THEN 1 END) as feedback_netral
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        ${whereClause}
      `;

      const [stats] = await connection.execute(statsQuery, params);

      // Statistik per kategori
      const kategoriQuery = `
        SELECT 
          f.kategori,
          COUNT(*) as jumlah,
          ROUND(AVG(f.rating), 2) as rata_rating
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        ${whereClause}
        GROUP BY f.kategori
        ORDER BY jumlah DESC
      `;

      const [kategori] = await connection.execute(kategoriQuery, params);

      // Trend harian
      const trendQuery = `
        SELECT 
          f.tanggal_feedback as tanggal,
          COUNT(*) as jumlah_feedback,
          ROUND(AVG(f.rating), 2) as rata_rating
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        ${whereClause}
        GROUP BY f.tanggal_feedback
        ORDER BY f.tanggal_feedback DESC
        LIMIT 30
      `;

      const [trend] = await connection.execute(trendQuery, params);

      // Ruangan dengan rating tertinggi/terendah
      const ruanganQuery = `
        SELECT 
          r.nama_ruangan,
          l.nomor_lantai,
          g.nama_gedung,
          COUNT(f.id_feedback) as total_feedback,
          ROUND(AVG(f.rating), 2) as rata_rating
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        JOIN gedung g ON l.id_gedung = g.id_gedung
        ${whereClause}
        GROUP BY r.id_ruangan, r.nama_ruangan, l.nomor_lantai, g.nama_gedung
        HAVING total_feedback >= 3
        ORDER BY rata_rating DESC, total_feedback DESC
        LIMIT 10
      `;

      const [ruangan] = await connection.execute(ruanganQuery, params);

      res.json({
        general_stats: stats[0],
        kategori_stats: kategori,
        daily_trend: trend,
        top_ruangan: ruangan
      });

    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      res.status(500).json({ message: 'Gagal mengambil statistik feedback' });
    } finally {
      connection.release();
    }
  },

  // Hapus feedback (untuk admin)
  async deleteFeedback(req, res) {
    const connection = await pool.getConnection();
    try {
      const { id_feedback } = req.params;

      // Cek apakah feedback ada
      const checkQuery = 'SELECT id_feedback FROM feedback_ruangan WHERE id_feedback = ?';
      const [existing] = await connection.execute(checkQuery, [id_feedback]);

      if (existing.length === 0) {
        return res.status(404).json({ message: 'Feedback tidak ditemukan' });
      }

      const deleteQuery = 'DELETE FROM feedback_ruangan WHERE id_feedback = ?';
      await connection.execute(deleteQuery, [id_feedback]);

      res.json({ message: 'Feedback berhasil dihapus' });

    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ message: 'Gagal menghapus feedback' });
    } finally {
      connection.release();
    }
  },

  // Update feedback (semua field bisa diubah)
async updateFeedback(req, res) {
  const connection = await pool.getConnection();
  try {
    const { id_feedback } = req.params;
    const { nama_pengguna, email_pengguna, rating, komentar, kategori } = req.body;

    // Cek apakah feedback ada
    const checkQuery = 'SELECT id_feedback FROM feedback_ruangan WHERE id_feedback = ?';
    const [existing] = await connection.execute(checkQuery, [id_feedback]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Feedback tidak ditemukan' });
    }

    // Siapkan field yang mau diupdate
    let updateFields = [];
    let params = [];

    if (nama_pengguna !== undefined) {
      updateFields.push('nama_pengguna = ?');
      params.push(nama_pengguna);
    }
    if (email_pengguna !== undefined) {
      updateFields.push('email_pengguna = ?');
      params.push(email_pengguna);
    }
    if (rating !== undefined) {
      updateFields.push('rating = ?');
      params.push(rating);
    }
    if (komentar !== undefined) {
      updateFields.push('komentar = ?');
      params.push(komentar);
    }
    if (kategori !== undefined) {
      const validKategori = ['fasilitas', 'kebersihan', 'kenyamanan', 'pelayanan', 'lainnya'];
      updateFields.push('kategori = ?');
      params.push(validKategori.includes(kategori) ? kategori : 'lainnya');
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada field yang valid untuk diupdate' });
    }

    // Tambahkan id_feedback di akhir parameter
    params.push(id_feedback);

    const updateQuery = `
      UPDATE feedback_ruangan 
      SET ${updateFields.join(', ')} 
      WHERE id_feedback = ?
    `;

    await connection.execute(updateQuery, params);

    res.json({ message: 'Feedback berhasil diupdate' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Gagal mengupdate feedback' });
  } finally {
    connection.release();
  }
},


  // Ambil semua feedback (untuk admin dashboard)
  async getAllFeedback(req, res) {
    const connection = await pool.getConnection();
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          f.id_feedback,
          f.id_ruangan,
          f.nama_pengguna,
          f.email_pengguna,
          f.rating,
          f.komentar,
          f.kategori,
          f.tanggal_feedback,
          f.created_at,
          r.nama_ruangan,
          l.nomor_lantai,
          g.nama_gedung,
          DATE_FORMAT(f.created_at, '%d %b %Y %H:%i') as waktu_formatted,
          DATE_FORMAT(f.tanggal_feedback, '%d %b %Y') as tanggal_formatted
        FROM feedback_ruangan f
        JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        JOIN lantai l ON r.id_lantai = l.id_lantai
        JOIN gedung g ON l.id_gedung = g.id_gedung
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await connection.execute(query, [parseInt(limit), parseInt(offset)]);

      // Hitung total untuk pagination
      const countQuery = `SELECT COUNT(*) as total FROM feedback_ruangan`;
      const [countResult] = await connection.execute(countQuery);

      res.json({
        data: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      res.status(500).json({ message: 'Gagal mengambil semua feedback' });
    } finally {
      connection.release();
    }
  }
};

module.exports = feedbackController;
