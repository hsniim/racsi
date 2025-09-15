const pool = require("../config/db");

// GET semua gedung beserta PJ-nya
const getGedungs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        g.id_gedung, g.nama_gedung, g.lokasi_gedung,
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
    res.status(500).json({ message: "Gagal mengambil data gedung" });
  }
};

// POST tambah gedung + PJ Gedung
const addGedung = async (req, res) => {
  const { nama_gedung, lokasi_gedung, pj } = req.body;

  if (!nama_gedung || !lokasi_gedung) {
    return res.status(400).json({ message: "Nama dan lokasi gedung wajib diisi" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO gedung (nama_gedung, lokasi_gedung) VALUES (?, ?)",
      [nama_gedung, lokasi_gedung]
    );

    const id_gedung = result.insertId;

    if (pj && pj.nama && pj.no_telp) {
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
    }

    res.json({ message: "Gedung dan PJ berhasil ditambahkan" });
  } catch (err) {
    console.error("Error addGedung:", err);
    res.status(500).json({ message: "Gagal menambahkan gedung" });
  }
};

// PUT update gedung + PJ Gedung
const updateGedung = async (req, res) => {
  const { id } = req.params;
  const { nama_gedung, lokasi_gedung, pj } = req.body;

  try {
    await pool.query(
      "UPDATE gedung SET nama_gedung = ?, lokasi_gedung = ? WHERE id_gedung = ?",
      [nama_gedung, lokasi_gedung, id]
    );

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

    res.json({ message: "Gedung dan PJ berhasil diperbarui" });
  } catch (err) {
    console.error("Error updateGedung:", err);
    res.status(500).json({ message: "Gagal memperbarui gedung" });
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
    res.status(500).json({ message: "Gagal menghapus gedung" });
  }
};

module.exports = { getGedungs, addGedung, updateGedung, deleteGedung };
