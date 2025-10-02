const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi storage untuk multer - FIXED folder paths
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;
    
    // Tentukan folder berdasarkan fieldname
    if (file.fieldname === 'qrcode_feedback') {
      uploadDir = path.join(__dirname, '../uploads/qr_feedback');
    } else if (file.fieldname === 'qrcode_peminjaman') {
      uploadDir = path.join(__dirname, '../uploads/qr_peminjaman');
    } else if (file.fieldname === 'qrcode_pjgedung') {
      uploadDir = path.join(__dirname, '../uploads/qr_pjgedung');
    } else {
      uploadDir = path.join(__dirname, '../uploads');
    }
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // Prefix berdasarkan fieldname
    let prefix = 'qr_';
    if (file.fieldname === 'qrcode_feedback') {
      prefix = 'qr_feedback_';
    } else if (file.fieldname === 'qrcode_peminjaman') {
      prefix = 'qr_peminjaman_';
    } else if (file.fieldname === 'qrcode_pjgedung') {
      prefix = 'qr_pjgedung_';
    }
    
    cb(null, prefix + uniqueSuffix + ext);
  }
});

// Filter file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file .png, .jpg, dan .jpeg yang diperbolehkan!'));
  }
};

// Multer upload instance - UPDATED to handle multiple fields
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
}).fields([
  { name: 'qrcode_feedback', maxCount: 1 },
  { name: 'qrcode_peminjaman', maxCount: 1 },
  { name: 'qrcode_pjgedung', maxCount: 1 }
]);

// Helper function to delete old file
const deleteOldFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log('Old file deleted:', filePath);
    } catch (err) {
      console.error('Error deleting old file:', err);
    }
  }
};

// Helper function to convert DB path to URL - FIXED
const convertPathToURL = (qrPath) => {
  if (!qrPath) return null;
  
  // Handle Buffer (BLOB) - convert to string
  if (Buffer.isBuffer(qrPath)) {
    qrPath = qrPath.toString('utf8');
  }
  
  // Jika sudah data:image atau http, return as is
  if (qrPath.startsWith('data:image') || qrPath.startsWith('http')) {
    return qrPath;
  }
  
  // Jika sudah dimulai dengan /uploads, return as is
  if (qrPath.startsWith('/uploads')) {
    return qrPath;
  }
  
  // Jika masih berupa file path absolut, convert ke relative URL
  const filename = path.basename(qrPath);
  
  // Deteksi folder berdasarkan prefix filename
  if (filename.startsWith('qr_feedback_')) {
    return `/uploads/qr_feedback/${filename}`;
  } else if (filename.startsWith('qr_peminjaman_')) {
    return `/uploads/qr_peminjaman/${filename}`;
  } else if (filename.startsWith('qr_pjgedung_')) {
    return `/uploads/qr_pjgedung/${filename}`;
  }
  
  // Default fallback
  return `/uploads/${filename}`;
};

// GET semua gedung beserta PJ-nya
const getGedungs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        g.id_gedung, g.nama_gedung, g.lokasi_gedung, g.qrcode_feedback,
        p.id_pj_gedung, p.nama AS pj_nama, p.no_telp AS pj_no_telp,
        p.link_peminjaman AS pj_link, p.qrcode_peminjaman AS pj_qr_pinjam,
        p.qrcode_pjgedung AS pj_qr_kontak
      FROM gedung g
      LEFT JOIN pj_gedung p ON g.id_gedung = p.id_gedung
    `);

    const data = rows.map((row) => {
      const qrFeedbackUrl = convertPathToURL(row.qrcode_feedback);
      const qrPinjamUrl = convertPathToURL(row.pj_qr_pinjam);
      const qrKontakUrl = convertPathToURL(row.pj_qr_kontak);

      return {
        id_gedung: row.id_gedung,
        nama_gedung: row.nama_gedung,
        lokasi_gedung: row.lokasi_gedung,
        qrcode_feedback: qrFeedbackUrl,
        pj: row.id_pj_gedung
          ? {
              id_pj_gedung: row.id_pj_gedung,
              nama: row.pj_nama,
              no_telp: row.pj_no_telp,
              link_peminjaman: row.pj_link,
              qrcodepath_pinjam: qrPinjamUrl,
              qrcodepath_kontak: qrKontakUrl,
            }
          : null,
      };
    });

    res.json({ data });
  } catch (err) {
    console.error("Error getGedungs:", err);
    res.status(500).json({ message: "Gagal mengambil data gedung", error: err.message });
  }
};

// POST tambah gedung + PJ Gedung
const addGedung = async (req, res) => {
  console.log("=== START addGedung ===");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);
  
  const { nama_gedung, lokasi_gedung } = req.body;
  
  // Parse PJ data if it exists
  let pjData = null;
  if (req.body.pj) {
    try {
      pjData = typeof req.body.pj === 'string' ? JSON.parse(req.body.pj) : req.body.pj;
    } catch (e) {
      console.error("Error parsing PJ data:", e);
    }
  }

  if (!nama_gedung || !lokasi_gedung) {
    console.log("Validation failed: missing nama_gedung or lokasi_gedung");
    return res.status(400).json({ 
      message: "Nama dan lokasi gedung wajib diisi",
      received: { nama_gedung, lokasi_gedung }
    });
  }

  try {
    let qrFeedbackPath = null;
    let qrPeminjamanPath = null;
    let qrPjgedungPath = null;
    
    // Handle file uploads - FIXED fieldnames
    if (req.files) {
      if (req.files['qrcode_feedback']) {
        qrFeedbackPath = `/uploads/qr_feedback/${path.basename(req.files['qrcode_feedback'][0].path)}`;
        console.log("QR Feedback file uploaded:", qrFeedbackPath);
      }
      
      if (req.files['qrcode_peminjaman']) {
        qrPeminjamanPath = `/uploads/qr_peminjaman/${path.basename(req.files['qrcode_peminjaman'][0].path)}`;
        console.log("QR Peminjaman file uploaded:", qrPeminjamanPath);
      }
      
      if (req.files['qrcode_pjgedung']) {
        qrPjgedungPath = `/uploads/qr_pjgedung/${path.basename(req.files['qrcode_pjgedung'][0].path)}`;
        console.log("QR PJ Gedung file uploaded:", qrPjgedungPath);
      }
    }

    console.log("Inserting gedung with data:", {
      nama_gedung,
      lokasi_gedung,
      qrFeedbackPath
    });

    // INSERT gedung
    const [result] = await pool.query(
      "INSERT INTO gedung (nama_gedung, lokasi_gedung, qrcode_feedback) VALUES (?, ?, ?)",
      [nama_gedung, lokasi_gedung, qrFeedbackPath || null]
    );

    const id_gedung = result.insertId;
    console.log("Gedung inserted with ID:", id_gedung);

    // Insert PJ jika ada data PJ
    if (pjData && pjData.nama && pjData.no_telp) {
      console.log("Inserting PJ data:", pjData);
      
      try {
        await pool.query(
          "INSERT INTO pj_gedung (id_gedung, nama, no_telp, link_peminjaman, qrcode_peminjaman, qrcode_pjgedung) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id_gedung,
            pjData.nama,
            pjData.no_telp,
            pjData.link_peminjaman || "",
            qrPeminjamanPath || pjData.qrcodepath_pinjam || null,
            qrPjgedungPath || pjData.qrcodepath_kontak || null,
          ]
        );
        console.log("PJ data inserted successfully");
      } catch (pjError) {
        console.error("Error inserting PJ data:", pjError);
      }
    } else {
      console.log("No PJ data to insert");
    }

    const responseData = { 
      message: "Gedung dan PJ berhasil ditambahkan",
      id_gedung,
      qr_feedback_uploaded: !!qrFeedbackPath,
      qr_peminjaman_uploaded: !!qrPeminjamanPath,
      qr_pjgedung_uploaded: !!qrPjgedungPath
    };

    console.log("Sending success response:", responseData);
    res.json(responseData);

  } catch (err) {
    console.error("=== ERROR in addGedung ===");
    console.error("Error details:", err);
    console.error("Error stack:", err.stack);
    
    // Delete uploaded files if database insert fails
    if (req.files) {
      if (req.files['qrcode_feedback']) deleteOldFile(req.files['qrcode_feedback'][0].path);
      if (req.files['qrcode_peminjaman']) deleteOldFile(req.files['qrcode_peminjaman'][0].path);
      if (req.files['qrcode_pjgedung']) deleteOldFile(req.files['qrcode_pjgedung'][0].path);
    }
    
    res.status(500).json({ 
      message: "Gagal menambahkan gedung", 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    console.log("=== END addGedung ===");
  }
};

// PUT update gedung + PJ Gedung
const updateGedung = async (req, res) => {
  console.log("=== START updateGedung ===");
  console.log("Params:", req.params);
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);
  
  const { id } = req.params;
  const { nama_gedung, lokasi_gedung } = req.body;
  
  // Parse PJ data if it exists
  let pjData = null;
  if (req.body.pj) {
    try {
      pjData = typeof req.body.pj === 'string' ? JSON.parse(req.body.pj) : req.body.pj;
    } catch (e) {
      console.error("Error parsing PJ data:", e);
    }
  }

  try {
    let qrFeedbackPath = null;
    let qrPeminjamanPath = null;
    let qrPjgedungPath = null;
    
    // Get old data untuk delete old files if needed
    const [oldData] = await pool.query("SELECT qrcode_feedback FROM gedung WHERE id_gedung = ?", [id]);
    const [oldPJData] = await pool.query("SELECT qrcode_peminjaman, qrcode_pjgedung FROM pj_gedung WHERE id_gedung = ?", [id]);
    
    // Handle QR Feedback update
    if (req.files && req.files['qrcode_feedback']) {
      qrFeedbackPath = `/uploads/qr_feedback/${path.basename(req.files['qrcode_feedback'][0].path)}`;
      console.log("New QR Feedback file uploaded:", qrFeedbackPath);
      
      // Delete old file if exists
      if (oldData.length > 0 && oldData[0].qrcode_feedback) {
        let oldFilePath = oldData[0].qrcode_feedback;
        if (Buffer.isBuffer(oldFilePath)) {
          oldFilePath = oldFilePath.toString('utf8');
        }
        if (oldFilePath && typeof oldFilePath === 'string') {
          if (!oldFilePath.startsWith('data:image') && !oldFilePath.startsWith('http')) {
            if (oldFilePath.startsWith('/uploads')) {
              oldFilePath = path.join(__dirname, '..', oldFilePath);
            }
            deleteOldFile(oldFilePath);
          }
        }
      }
    } else if (oldData.length > 0 && oldData[0].qrcode_feedback) {
      qrFeedbackPath = oldData[0].qrcode_feedback;
      if (Buffer.isBuffer(qrFeedbackPath)) {
        qrFeedbackPath = qrFeedbackPath.toString('utf8');
      }
    }

    // Handle QR Peminjaman update
    if (req.files && req.files['qrcode_peminjaman']) {
      qrPeminjamanPath = `/uploads/qr_peminjaman/${path.basename(req.files['qrcode_peminjaman'][0].path)}`;
      console.log("New QR Peminjaman file uploaded:", qrPeminjamanPath);
      
      if (oldPJData.length > 0 && oldPJData[0].qrcode_peminjaman) {
        let oldFilePath = oldPJData[0].qrcode_peminjaman;
        if (Buffer.isBuffer(oldFilePath)) {
          oldFilePath = oldFilePath.toString('utf8');
        }
        if (oldFilePath && typeof oldFilePath === 'string') {
          if (!oldFilePath.startsWith('data:image') && !oldFilePath.startsWith('http')) {
            if (oldFilePath.startsWith('/uploads')) {
              oldFilePath = path.join(__dirname, '..', oldFilePath);
            }
            deleteOldFile(oldFilePath);
          }
        }
      }
    } else if (oldPJData.length > 0 && oldPJData[0].qrcode_peminjaman) {
      qrPeminjamanPath = oldPJData[0].qrcode_peminjaman;
      if (Buffer.isBuffer(qrPeminjamanPath)) {
        qrPeminjamanPath = qrPeminjamanPath.toString('utf8');
      }
    }

    // Handle QR PJ Gedung update
    if (req.files && req.files['qrcode_pjgedung']) {
      qrPjgedungPath = `/uploads/qr_pjgedung/${path.basename(req.files['qrcode_pjgedung'][0].path)}`;
      console.log("New QR PJ Gedung file uploaded:", qrPjgedungPath);
      
      if (oldPJData.length > 0 && oldPJData[0].qrcode_pjgedung) {
        let oldFilePath = oldPJData[0].qrcode_pjgedung;
        if (Buffer.isBuffer(oldFilePath)) {
          oldFilePath = oldFilePath.toString('utf8');
        }
        if (oldFilePath && typeof oldFilePath === 'string') {
          if (!oldFilePath.startsWith('data:image') && !oldFilePath.startsWith('http')) {
            if (oldFilePath.startsWith('/uploads')) {
              oldFilePath = path.join(__dirname, '..', oldFilePath);
            }
            deleteOldFile(oldFilePath);
          }
        }
      }
    } else if (oldPJData.length > 0 && oldPJData[0].qrcode_pjgedung) {
      qrPjgedungPath = oldPJData[0].qrcode_pjgedung;
      if (Buffer.isBuffer(qrPjgedungPath)) {
        qrPjgedungPath = qrPjgedungPath.toString('utf8');
      }
    }

    // UPDATE gedung
    await pool.query(
      "UPDATE gedung SET nama_gedung = ?, lokasi_gedung = ?, qrcode_feedback = ? WHERE id_gedung = ?",
      [nama_gedung, lokasi_gedung, qrFeedbackPath || null, id]
    );

    // Handle PJ data
    if (pjData && pjData.nama && pjData.no_telp) {
      const [existingPJ] = await pool.query("SELECT * FROM pj_gedung WHERE id_gedung = ?", [id]);

      if (existingPJ.length > 0) {
        await pool.query(
          "UPDATE pj_gedung SET nama = ?, no_telp = ?, link_peminjaman = ?, qrcode_peminjaman = ?, qrcode_pjgedung = ? WHERE id_gedung = ?",
          [
            pjData.nama,
            pjData.no_telp,
            pjData.link_peminjaman || "",
            qrPeminjamanPath || null,
            qrPjgedungPath || null,
            id,
          ]
        );
      } else {
        await pool.query(
          "INSERT INTO pj_gedung (id_gedung, nama, no_telp, link_peminjaman, qrcode_peminjaman, qrcode_pjgedung) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id,
            pjData.nama,
            pjData.no_telp,
            pjData.link_peminjaman || "",
            qrPeminjamanPath || null,
            qrPjgedungPath || null,
          ]
        );
      }
    }

    res.json({ 
      message: "Gedung dan PJ berhasil diperbarui",
      qr_feedback_uploaded: !!(req.files && req.files['qrcode_feedback']),
      qr_peminjaman_uploaded: !!(req.files && req.files['qrcode_peminjaman']),
      qr_pjgedung_uploaded: !!(req.files && req.files['qrcode_pjgedung'])
    });
  } catch (err) {
    console.error("=== ERROR in updateGedung ===");
    console.error("Error details:", err);
    
    // Delete uploaded files if database update fails
    if (req.files) {
      if (req.files['qrcode_feedback']) deleteOldFile(req.files['qrcode_feedback'][0].path);
      if (req.files['qrcode_peminjaman']) deleteOldFile(req.files['qrcode_peminjaman'][0].path);
      if (req.files['qrcode_pjgedung']) deleteOldFile(req.files['qrcode_pjgedung'][0].path);
    }
    
    res.status(500).json({ 
      message: "Gagal memperbarui gedung", 
      error: err.message 
    });
  } finally {
    console.log("=== END updateGedung ===");
  }
};

// DELETE gedung + PJ Gedung
const deleteGedung = async (req, res) => {
  const { id } = req.params;

  try {
    // Get file paths before deletion
    const [gedungData] = await pool.query("SELECT qrcode_feedback FROM gedung WHERE id_gedung = ?", [id]);
    const [pjData] = await pool.query("SELECT qrcode_peminjaman, qrcode_pjgedung FROM pj_gedung WHERE id_gedung = ?", [id]);
    
    // Delete from database
    await pool.query("DELETE FROM pj_gedung WHERE id_gedung = ?", [id]);
    await pool.query("DELETE FROM gedung WHERE id_gedung = ?", [id]);

    // Delete gedung feedback QR file if exists
    if (gedungData.length > 0 && gedungData[0].qrcode_feedback) {
      let filePath = gedungData[0].qrcode_feedback;
      if (Buffer.isBuffer(filePath)) {
        filePath = filePath.toString('utf8');
      }
      if (filePath && typeof filePath === 'string') {
        if (!filePath.startsWith('data:image') && !filePath.startsWith('http')) {
          if (filePath.startsWith('/uploads')) {
            filePath = path.join(__dirname, '..', filePath);
          }
          deleteOldFile(filePath);
        }
      }
    }

    // Delete PJ QR files if exist
    if (pjData.length > 0) {
      // Delete QR Peminjaman
      if (pjData[0].qrcode_peminjaman) {
        let filePath = pjData[0].qrcode_peminjaman;
        if (Buffer.isBuffer(filePath)) {
          filePath = filePath.toString('utf8');
        }
        if (filePath && typeof filePath === 'string') {
          if (!filePath.startsWith('data:image') && !filePath.startsWith('http')) {
            if (filePath.startsWith('/uploads')) {
              filePath = path.join(__dirname, '..', filePath);
            }
            deleteOldFile(filePath);
          }
        }
      }

      // Delete QR PJ Gedung
      if (pjData[0].qrcode_pjgedung) {
        let filePath = pjData[0].qrcode_pjgedung;
        if (Buffer.isBuffer(filePath)) {
          filePath = filePath.toString('utf8');
        }
        if (filePath && typeof filePath === 'string') {
          if (!filePath.startsWith('data:image') && !filePath.startsWith('http')) {
            if (filePath.startsWith('/uploads')) {
              filePath = path.join(__dirname, '..', filePath);
            }
            deleteOldFile(filePath);
          }
        }
      }
    }

    res.json({ message: "Gedung dan PJ berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteGedung:", err);
    res.status(500).json({ 
      message: "Gagal menghapus gedung", 
      error: err.message 
    });
  }
};

// GET QR Code feedback untuk gedung tertentu
const getGedungFeedbackQR = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting feedback QR for gedung: ${id}`);

    const [gedungData] = await pool.query(
      "SELECT nama_gedung, lokasi_gedung, qrcode_feedback FROM gedung WHERE id_gedung = ?",
      [id]
    );

    if (gedungData.length === 0) {
      return res.status(404).json({ message: "Gedung tidak ditemukan" });
    }

    const gedung = gedungData[0];
    const qrFeedbackUrl = convertPathToURL(gedung.qrcode_feedback);
    
    console.log(`QR Code feedback for gedung ${id}:`, qrFeedbackUrl);

    res.json({
      message: "QR Code feedback gedung berhasil diambil",
      qrcodepath_feedback: qrFeedbackUrl,
      is_file_upload: !!(gedung.qrcode_feedback && qrFeedbackUrl && !qrFeedbackUrl.startsWith('data:image')),
      gedung_info: {
        id_gedung: id,
        nama_gedung: gedung.nama_gedung,
        lokasi_gedung: gedung.lokasi_gedung
      }
    });

  } catch (error) {
    console.error("Error getGedungFeedbackQR:", error);
    res.status(500).json({ 
      message: "Gagal mengambil QR Code feedback gedung", 
      error: error.message 
    });
  }
};

// Generate QR Code feedback untuk gedung (now accepts file upload)
const generateGedungFeedbackQR = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [gedungData] = await pool.query(
      "SELECT nama_gedung, lokasi_gedung, qrcode_feedback FROM gedung WHERE id_gedung = ?",
      [id]
    );

    if (gedungData.length === 0) {
      return res.status(404).json({ message: "Gedung tidak ditemukan" });
    }

    const gedung = gedungData[0];
    let qrFeedbackPath = null;
    
    // Jika ada file yang diupload
    if (req.file) {
      qrFeedbackPath = `/uploads/qr_feedback/${path.basename(req.file.path)}`;
      console.log("QR Feedback file uploaded for gedung:", id, qrFeedbackPath);
      
      // Delete old file if exists
      if (gedung.qrcode_feedback) {
        let oldFilePath = gedung.qrcode_feedback;
        
        if (Buffer.isBuffer(oldFilePath)) {
          oldFilePath = oldFilePath.toString('utf8');
        }
        
        if (oldFilePath && typeof oldFilePath === 'string') {
          if (!oldFilePath.startsWith('data:image') && !oldFilePath.startsWith('http')) {
            if (oldFilePath.startsWith('/uploads')) {
              oldFilePath = path.join(__dirname, '..', oldFilePath);
            }
            deleteOldFile(oldFilePath);
          }
        }
      }
    } else {
      return res.status(400).json({ message: "File QR Code tidak ditemukan" });
    }
    
    // Update database
    await pool.query(
      "UPDATE gedung SET qrcode_feedback = ? WHERE id_gedung = ?",
      [qrFeedbackPath, id]
    );
    
    console.log(`Generated and saved QR Code for gedung ${id}`);

    res.json({
      message: "QR Code feedback gedung berhasil diupload",
      qrcodepath_feedback: qrFeedbackPath,
      is_file_upload: true,
      gedung_info: {
        id_gedung: id,
        nama_gedung: gedung.nama_gedung,
        lokasi_gedung: gedung.lokasi_gedung
      }
    });

  } catch (error) {
    console.error("Error generateGedungFeedbackQR:", error);
    
    // Delete uploaded file if database update fails
    if (req.file) {
      deleteOldFile(req.file.path);
    }
    
    res.status(500).json({ 
      message: "Gagal mengupload QR Code feedback gedung", 
      error: error.message 
    });
  }
};

module.exports = { 
  getGedungs, 
  addGedung, 
  updateGedung, 
  deleteGedung,
  getGedungFeedbackQR,
  generateGedungFeedbackQR,
  upload // Export upload middleware
};