const pool = require('../config/db');

/** GET /api/tv-device */
exports.getDevices = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, 
             g.nama_gedung, 
             l.nomor_lantai,
             CONCAT('Lantai ', l.nomor_lantai) as nama_lantai
      FROM tv_device d
      JOIN gedung g ON g.id_gedung = d.id_gedung
      JOIN lantai l ON l.id_lantai = d.id_lantai
      ORDER BY d.id_device DESC
    `);
    
    console.log('TV Device query result:', rows); // Debug log
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('Error in getDevices:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** POST /api/tv-device */
exports.createDevice = async (req, res) => {
  try {
    const { nama_device, id_gedung, id_lantai } = req.body;
    if (!nama_device || !id_gedung || !id_lantai)
      return res.status(400).json({ success:false, message:'Field wajib diisi' });

    // Validasi apakah gedung dan lantai exist
    const [gedungCheck] = await pool.query('SELECT id_gedung FROM gedung WHERE id_gedung = ?', [id_gedung]);
    const [lantaiCheck] = await pool.query('SELECT id_lantai FROM lantai WHERE id_lantai = ? AND id_gedung = ?', [id_lantai, id_gedung]);
    
    if (!gedungCheck.length) {
      return res.status(400).json({ success: false, message: 'Gedung tidak ditemukan' });
    }
    
    if (!lantaiCheck.length) {
      return res.status(400).json({ success: false, message: 'Lantai tidak ditemukan atau tidak sesuai dengan gedung' });
    }

    const [result] = await pool.query(
      'INSERT INTO tv_device (nama_device, id_gedung, id_lantai) VALUES (?,?,?)',
      [nama_device, id_gedung, id_lantai]
    );
    res.json({ success: true, id_device: result.insertId, message: 'Device berhasil ditambahkan' });
  } catch (e) {
    console.error('Error in createDevice:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** PUT /api/tv-device/:id */
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_device, id_gedung, id_lantai } = req.body;
    
    // Validasi apakah device exist
    const [deviceCheck] = await pool.query('SELECT id_device FROM tv_device WHERE id_device = ?', [id]);
    if (!deviceCheck.length) {
      return res.status(404).json({ success: false, message: 'Device tidak ditemukan' });
    }
    
    // Validasi gedung dan lantai
    const [gedungCheck] = await pool.query('SELECT id_gedung FROM gedung WHERE id_gedung = ?', [id_gedung]);
    const [lantaiCheck] = await pool.query('SELECT id_lantai FROM lantai WHERE id_lantai = ? AND id_gedung = ?', [id_lantai, id_gedung]);
    
    if (!gedungCheck.length) {
      return res.status(400).json({ success: false, message: 'Gedung tidak ditemukan' });
    }
    
    if (!lantaiCheck.length) {
      return res.status(400).json({ success: false, message: 'Lantai tidak ditemukan atau tidak sesuai dengan gedung' });
    }
    
    await pool.query(
      'UPDATE tv_device SET nama_device=?, id_gedung=?, id_lantai=? WHERE id_device=?',
      [nama_device, id_gedung, id_lantai, id]
    );
    res.json({ success: true, message: 'Device berhasil diperbarui' });
  } catch (e) {
    console.error('Error in updateDevice:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** DELETE /api/tv-device/:id */
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah device exist
    const [deviceCheck] = await pool.query('SELECT id_device FROM tv_device WHERE id_device = ?', [id]);
    if (!deviceCheck.length) {
      return res.status(404).json({ success: false, message: 'Device tidak ditemukan' });
    }
    
    await pool.query('DELETE FROM tv_device WHERE id_device=?', [id]);
    res.json({ success: true, message: 'Device berhasil dihapus' });
  } catch (e) {
    console.error('Error in deleteDevice:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** GET /api/tv-device/:id/config */
exports.getConfigByDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT d.id_device, d.nama_device, d.id_gedung, g.nama_gedung, 
             d.id_lantai, l.nomor_lantai,
             CONCAT('Lantai ', l.nomor_lantai) as nama_lantai
      FROM tv_device d
      JOIN gedung g ON g.id_gedung = d.id_gedung
      JOIN lantai l ON l.id_lantai = d.id_lantai
      WHERE d.id_device = ? LIMIT 1
    `, [id]);
    
    if (!rows.length) return res.status(404).json({ success:false, message:'Device tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('Error in getConfigByDevice:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** GET /api/tv-device/:id/data  → data untuk tampilan TV */
exports.getDataForDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // cari lantai device
    const [dev] = await pool.query('SELECT id_lantai FROM tv_device WHERE id_device=?', [id]);
    if (!dev.length) return res.status(404).json({ success:false, message:'Device tidak ditemukan' });

    const id_lantai = dev[0].id_lantai;

    // ambil ruangan di lantai tsb + status sekarang dari jadwal
    const [rows] = await pool.query(`
      SELECT
        r.id_ruangan, r.nama_ruangan, r.kapasitas,
        -- status_now = 1 bila sedang dipakai sekarang
        CASE
          WHEN EXISTS (
            SELECT 1 FROM jadwal j
            JOIN kegiatan k ON k.id_kegiatan = j.id_kegiatan
            WHERE k.id_ruangan = r.id_ruangan
              AND CONCAT(j.tanggal, ' ', j.waktu_mulai) <= NOW()
              AND CONCAT(j.tanggal, ' ', j.waktu_selesai) >= NOW()
          ) THEN 1 ELSE 0
        END AS status_now
      FROM ruangan r
      WHERE r.id_lantai = ?
      ORDER BY r.nama_ruangan ASC
    `, [id_lantai]);

    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('Error in getDataForDevice:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};