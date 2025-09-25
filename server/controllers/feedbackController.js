const db = require("../config/db");

// Create feedback tanpa QR code path
exports.createFeedback = async (req, res) => {
  try {
    const { id_ruangan, nama_pengguna, email_pengguna, rating, komentar, kategori, tanggal_feedback } = req.body;

    const [result] = await db.query(
      "INSERT INTO feedback_ruangan (id_ruangan, nama_pengguna, email_pengguna, rating, komentar, kategori, tanggal_feedback) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id_ruangan, nama_pengguna, email_pengguna, rating, komentar, kategori, tanggal_feedback]
    );

    res.status(201).json({ 
      message: "Feedback berhasil ditambahkan", 
      id: result.insertId
    });
  } catch (error) {
    console.error("Error createFeedback:", error);
    res.status(500).json({ message: "Gagal menambahkan feedback" });
  }
};

// Get all feedback tanpa QR code path
exports.getAllFeedback = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.*,
        r.nama_ruangan,
        l.nomor_lantai,
        g.nama_gedung
      FROM feedback_ruangan f
      LEFT JOIN ruangan r ON f.id_ruangan = r.id_ruangan
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      ORDER BY f.id_feedback DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error("Error getAllFeedback:", error);
    res.status(500).json({ message: "Gagal mengambil semua feedback" });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT 
        f.*,
        r.nama_ruangan,
        l.nomor_lantai,
        g.nama_gedung
      FROM feedback_ruangan f
      LEFT JOIN ruangan r ON f.id_ruangan = r.id_ruangan
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      WHERE f.id_feedback = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Feedback tidak ditemukan" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error getFeedbackById:", error);
    res.status(500).json({ message: "Gagal mengambil feedback" });
  }
};

// Get feedback by ruangan tanpa QR code
exports.getFeedbackByRuangan = async (req, res) => {
  try {
    const { id_ruangan } = req.params;
    const [rows] = await db.query(`
      SELECT 
        f.*,
        r.nama_ruangan,
        l.nomor_lantai,
        g.nama_gedung
      FROM feedback_ruangan f
      LEFT JOIN ruangan r ON f.id_ruangan = r.id_ruangan
      LEFT JOIN lantai l ON r.id_lantai = l.id_lantai
      LEFT JOIN gedung g ON l.id_gedung = g.id_gedung
      WHERE f.id_ruangan = ?
      ORDER BY f.created_at DESC
    `, [id_ruangan]);
    res.json(rows);
  } catch (error) {
    console.error("Error getFeedbackByRuangan:", error);
    res.status(500).json({ message: "Gagal mengambil feedback berdasarkan ruangan" });
  }
};

// Update feedback tanpa QR code path
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_pengguna, email_pengguna, rating, komentar, kategori } = req.body;
    
    const updateQuery = `
      UPDATE feedback_ruangan 
      SET nama_pengguna = ?, email_pengguna = ?, rating = ?, komentar = ?, kategori = ?
      WHERE id_feedback = ?
    `;
    const params = [nama_pengguna, email_pengguna, rating, komentar, kategori, id];

    const [result] = await db.query(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback tidak ditemukan" });
    }

    res.json({ message: "Feedback berhasil diperbarui" });
  } catch (error) {
    console.error("Error updateFeedback:", error);
    res.status(500).json({ message: "Gagal memperbarui feedback" });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM feedback_ruangan WHERE id_feedback = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback tidak ditemukan" });
    }
    
    res.json({ message: "Feedback berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteFeedback:", error);
    res.status(500).json({ message: "Gagal menghapus feedback" });
  }
};

// Feedback stats
exports.getFeedbackStats = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT rating, COUNT(*) as jumlah FROM feedback_ruangan GROUP BY rating ORDER BY rating DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error getFeedbackStats:", error);
    res.status(500).json({ message: "Gagal mengambil statistik feedback" });
  }
};

// FEEDBACK SUMMARY - Tanpa QR Code
exports.getFeedbackSummary = async (req, res) => {
  try {
    const { id_gedung, id_lantai } = req.query;

    console.log(`getFeedbackSummary called with id_gedung: ${id_gedung}, id_lantai: ${id_lantai}`);

    // Query untuk mendapatkan semua ruangan di lantai tersebut dengan rating masing-masing
    const [ruanganData] = await db.query(`
      SELECT DISTINCT r.id_ruangan, r.nama_ruangan
      FROM ruangan r
      INNER JOIN lantai l ON r.id_lantai = l.id_lantai
      WHERE l.id_gedung = ? AND l.id_lantai = ?
      ORDER BY r.nama_ruangan
    `, [id_gedung, id_lantai]);

    if (!ruanganData.length) {
      console.log("No ruangan found for this lantai");
      return res.json({ 
        summary: [], 
        recent_comments: [] 
      });
    }

    // Dapatkan feedback untuk setiap ruangan secara terpisah
    let allFeedbacks = [];
    let summaryData = [];

    for (const ruangan of ruanganData) {
      const [feedbacks] = await db.query(`
        SELECT 
          f.rating, 
          f.komentar, 
          f.tanggal_feedback, 
          f.id_feedback,
          f.nama_pengguna,
          r.nama_ruangan
        FROM feedback_ruangan f
        INNER JOIN ruangan r ON f.id_ruangan = r.id_ruangan
        WHERE f.id_ruangan = ?
        ORDER BY f.created_at DESC, f.id_feedback DESC
      `, [ruangan.id_ruangan]);

      // Tambahkan feedback ke array total untuk recent comments
      allFeedbacks = allFeedbacks.concat(feedbacks.map(f => ({
        ...f,
        nama_ruang: f.nama_ruangan
      })));

      // Hitung rating rata-rata PER RUANGAN
      if (feedbacks.length > 0) {
        const ratingSum = feedbacks.reduce((sum, feedback) => {
          const rating = parseFloat(feedback.rating);
          return sum + (isNaN(rating) ? 0 : rating);
        }, 0);

        const avgRating = ratingSum / feedbacks.length;

        console.log(`Ruangan ${ruangan.nama_ruangan}: ${feedbacks.length} feedback, rata-rata: ${avgRating}`);

        summaryData.push({
          id_ruangan: ruangan.id_ruangan,
          nama_ruang: ruangan.nama_ruangan,
          rata_rating: parseFloat(avgRating.toFixed(1)),
          total_feedback: feedbacks.length
        });
      }
    }

    // Sort all feedbacks by creation time for recent comments
    allFeedbacks.sort((a, b) => new Date(b.tanggal_feedback) - new Date(a.tanggal_feedback));

    // Get recent comments dari semua ruangan (tanpa QR code)
    const recent_comments = allFeedbacks
      .filter(f => f.komentar && f.komentar.toString().trim() !== "")
      .slice(0, 10)
      .map(f => ({
        komentar: f.komentar.toString().trim(),
        nama_ruang: f.nama_ruang,
        nama_pengguna: f.nama_pengguna || "Tidak diketahui"
      }));

    const response = {
      summary: summaryData,
      recent_comments
    };

    console.log("Final response (per ruangan):", JSON.stringify(response, null, 2));
    res.json(response);

  } catch (err) {
    console.error("Error getFeedbackSummary:", err);
    res.status(500).json({ 
      message: "Gagal mengambil summary feedback", 
      error: err.message,
      summary: [], 
      recent_comments: [] 
    });
  }
};