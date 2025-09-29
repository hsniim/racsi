const pool = require("../config/db");
const QRCode = require("qrcode"); // Legacy QR Code generator

// Function to check if string is a URL
const isUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Function to generate QR Code using legacy qrcode library
const generateQRCode = async (url, options = {}) => {
  try {
    console.log(`Generating QR Code with legacy library for URL: ${url}`);
    
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: options.width || 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    // Generate QR code as data URL (base64)
    const dataUrl = await QRCode.toDataURL(url, qrOptions);
    
    console.log(`QR Code generated successfully with legacy library`);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code with legacy library:', error.message);
    throw error;
  }
};

// GET semua gedung beserta PJ-nya
const getGedungs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        g.id_gedung, g.nama_gedung, g.lokasi_gedung, g.qrcode_feedback,
        p.id_pj_gedung, p.nama AS pj_nama, p.no_telp AS pj_no_telp,
        p.link_peminjaman AS pj_link, p.qrcodepath_pinjam AS pj_qr_pinjam,
        p.qrcodepath_kontak AS pj_qr_kontak
      FROM gedung g
      LEFT JOIN pj_gedung p ON g.id_gedung = p.id_gedung
    `);

    const data = rows.map((row) => ({
      id_gedung: row.id_gedung,
      nama_gedung: row.nama_gedung,
      lokasi_gedung: row.lokasi_gedung,
      qrcode_feedback: row.qrcode_feedback,
      pj: row.id_pj_gedung
        ? {
            id_pj_gedung: row.id_pj_gedung,
            nama: row.pj_nama,
            no_telp: row.pj_no_telp,
            link_peminjaman: row.pj_link,
            qrcodepath_pinjam: row.pj_qr_pinjam,
            qrcodepath_kontak: row.pj_qr_kontak,
          }
        : null,
    }));

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
  
  const { nama_gedung, lokasi_gedung, qrcode_feedback, pj } = req.body;

  if (!nama_gedung || !lokasi_gedung) {
    console.log("Validation failed: missing nama_gedung or lokasi_gedung");
    return res.status(400).json({ 
      message: "Nama dan lokasi gedung wajib diisi",
      received: { nama_gedung, lokasi_gedung }
    });
  }

  try {
    let finalQrcodeFeedback = qrcode_feedback;

    // Generate QR jika qrcode_feedback adalah URL valid
    if (qrcode_feedback && isUrl(qrcode_feedback)) {
      try {
        console.log(`Generating QR code for URL: ${qrcode_feedback}`);
        const generatedQrDataUrl = await generateQRCode(qrcode_feedback, { width: 300 });
        finalQrcodeFeedback = generatedQrDataUrl;
        console.log(`QR Code generated successfully as data URL (legacy)`);
      } catch (qrError) {
        console.error('QR generation failed, continuing with original URL:', qrError.message);
        finalQrcodeFeedback = qrcode_feedback;
      }
    } else {
      console.log('qrcode_feedback is not a URL or empty, skipping QR generation');
    }

    console.log("Inserting gedung with data:", {
      nama_gedung,
      lokasi_gedung,
      finalQrcodeFeedback: finalQrcodeFeedback ? 'Data URL (base64)' : null
    });

    // INSERT gedung
    const [result] = await pool.query(
      "INSERT INTO gedung (nama_gedung, lokasi_gedung, qrcode_feedback) VALUES (?, ?, ?)",
      [nama_gedung, lokasi_gedung, finalQrcodeFeedback || null]
    );

    const id_gedung = result.insertId;
    console.log("Gedung inserted with ID:", id_gedung);

    // Insert PJ jika ada data PJ
    if (pj && pj.nama && pj.no_telp) {
      console.log("Inserting PJ data:", pj);
      
      try {
        await pool.query(
          "INSERT INTO pj_gedung (id_gedung, nama, no_telp, link_peminjaman, qrcodepath_pinjam, qrcodepath_kontak) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id_gedung,
            pj.nama,
            pj.no_telp,
            pj.link_peminjaman || "",
            pj.qrcodepath_pinjam || null,
            pj.qrcodepath_kontak || null,
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
      qr_generated: isUrl(qrcode_feedback),
      original_url: isUrl(qrcode_feedback) ? qrcode_feedback : null,
      qr_type: 'legacy_base64'
    };

    console.log("Sending success response:", responseData);
    res.json(responseData);

  } catch (err) {
    console.error("=== ERROR in addGedung ===");
    console.error("Error details:", err);
    console.error("Error stack:", err.stack);
    
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
  
  const { id } = req.params;
  const { nama_gedung, lokasi_gedung, qrcode_feedback, pj } = req.body;

  try {
    let finalQrcodeFeedback = qrcode_feedback;

    // Generate QR code if qrcode_feedback is a URL
    if (qrcode_feedback && isUrl(qrcode_feedback)) {
      try {
        console.log(`Generating QR code for URL: ${qrcode_feedback}`);
        const generatedQrDataUrl = await generateQRCode(qrcode_feedback, { width: 300 });
        finalQrcodeFeedback = generatedQrDataUrl;
        console.log(`QR Code generated successfully as data URL (legacy)`);
      } catch (qrError) {
        console.error('QR generation failed, continuing with original URL:', qrError.message);
        finalQrcodeFeedback = qrcode_feedback;
      }
    }

    // UPDATE gedung
    await pool.query(
      "UPDATE gedung SET nama_gedung = ?, lokasi_gedung = ?, qrcode_feedback = ? WHERE id_gedung = ?",
      [nama_gedung, lokasi_gedung, finalQrcodeFeedback || null, id]
    );

    // Handle PJ data
    if (pj && pj.nama && pj.no_telp) {
      const [existingPJ] = await pool.query("SELECT * FROM pj_gedung WHERE id_gedung = ?", [id]);

      if (existingPJ.length > 0) {
        await pool.query(
          "UPDATE pj_gedung SET nama = ?, no_telp = ?, link_peminjaman = ?, qrcodepath_pinjam = ?, qrcodepath_kontak = ? WHERE id_gedung = ?",
          [
            pj.nama,
            pj.no_telp,
            pj.link_peminjaman || "",
            pj.qrcodepath_pinjam || null,
            pj.qrcodepath_kontak || null,
            id,
          ]
        );
      } else {
        await pool.query(
          "INSERT INTO pj_gedung (id_gedung, nama, no_telp, link_peminjaman, qrcodepath_pinjam, qrcodepath_kontak) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id,
            pj.nama,
            pj.no_telp,
            pj.link_peminjaman || "",
            pj.qrcodepath_pinjam || null,
            pj.qrcodepath_kontak || null,
          ]
        );
      }
    }

    res.json({ 
      message: "Gedung dan PJ berhasil diperbarui",
      qr_generated: isUrl(qrcode_feedback),
      original_url: isUrl(qrcode_feedback) ? qrcode_feedback : null,
      qr_type: 'legacy_base64'
    });
  } catch (err) {
    console.error("=== ERROR in updateGedung ===");
    console.error("Error details:", err);
    
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
    await pool.query("DELETE FROM pj_gedung WHERE id_gedung = ?", [id]);
    await pool.query("DELETE FROM gedung WHERE id_gedung = ?", [id]);

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
    
    console.log(`QR Code feedback for gedung ${id}: ${gedung.qrcode_feedback ? 'Available (base64)' : 'Not available'}`);

    const isBase64Qr = gedung.qrcode_feedback && gedung.qrcode_feedback.startsWith('data:image/png;base64,');

    res.json({
      message: "QR Code feedback gedung berhasil diambil",
      qrcodepath_feedback: gedung.qrcode_feedback,
      is_generated_qr: isBase64Qr,
      qr_type: 'legacy_base64',
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

// Generate QR Code feedback untuk gedung
const generateGedungFeedbackQR = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;
    
    const [gedungData] = await pool.query(
      "SELECT nama_gedung, lokasi_gedung FROM gedung WHERE id_gedung = ?",
      [id]
    );

    if (gedungData.length === 0) {
      return res.status(404).json({ message: "Gedung tidak ditemukan" });
    }

    const gedung = gedungData[0];
    
    const qrContent = url || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/feedback/gedung/${id}`;
    
    const qrCodeDataUrl = await generateQRCode(qrContent, { width: 300 });
    
    await pool.query(
      "UPDATE gedung SET qrcode_feedback = ? WHERE id_gedung = ?",
      [qrCodeDataUrl, id]
    );
    
    console.log(`Generated and saved QR Code for gedung ${id} using legacy library`);

    res.json({
      message: "QR Code feedback gedung berhasil dibuat",
      qrcodepath_feedback: qrCodeDataUrl,
      original_url: qrContent,
      qr_type: 'legacy_base64',
      gedung_info: {
        id_gedung: id,
        nama_gedung: gedung.nama_gedung,
        lokasi_gedung: gedung.lokasi_gedung
      }
    });

  } catch (error) {
    console.error("Error generateGedungFeedbackQR:", error);
    res.status(500).json({ 
      message: "Gagal membuat QR Code feedback gedung", 
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
  generateGedungFeedbackQR
};