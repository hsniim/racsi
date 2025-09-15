const pool = require("../config/db");

// GET semua lantai beserta semua PJ (bisa lebih dari satu shift)
const getLantais = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.id_lantai, l.id_gedung, l.nomor_lantai, g.nama_gedung,
        pj.id_pj_lantai, pj.nama AS pj_nama, pj.shift
      FROM lantai l
      JOIN gedung g ON g.id_gedung = l.id_gedung
      LEFT JOIN pj_lantai pj ON pj.id_lantai = l.id_lantai
      ORDER BY l.id_lantai, pj.shift
    `);

    // grupkan PJ per lantai
    const data = Object.values(
      rows.reduce((acc, r) => {
        if (!acc[r.id_lantai]) {
          acc[r.id_lantai] = {
            id_lantai: r.id_lantai,
            id_gedung: r.id_gedung,
            nama_gedung: r.nama_gedung,
            nomor_lantai: r.nomor_lantai,
            pjs: [],
          };
        }
        if (r.id_pj_lantai) {
          acc[r.id_lantai].pjs.push({
            id_pj_lantai: r.id_pj_lantai,
            nama: r.pj_nama,
            shift: r.shift,
          });
        }
        return acc;
      }, {})
    );

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data lantai" });
  }
};

// POST tambah lantai atau PJ
const addLantai = async (req, res) => {
  const { id_gedung, nomor_lantai, pj } = req.body;
  if (!id_gedung || !nomor_lantai || !pj?.nama || !pj?.shift) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // cek apakah lantai sudah ada
    const [lantaiRows] = await conn.query(
      "SELECT id_lantai FROM lantai WHERE id_gedung=? AND nomor_lantai=?",
      [id_gedung, nomor_lantai]
    );

    let id_lantai;
    if (lantaiRows.length > 0) {
      id_lantai = lantaiRows[0].id_lantai;
    } else {
      const [lantaiResult] = await conn.query(
        "INSERT INTO lantai (id_gedung, nomor_lantai, created_at) VALUES (?, ?, NOW())",
        [id_gedung, nomor_lantai]
      );
      id_lantai = lantaiResult.insertId;
    }

    // insert PJ (akan error otomatis kalau kombinasi shift sama, karena UNIQUE KEY)
    await conn.query(
      "INSERT INTO pj_lantai (id_lantai, shift, nama, created_at) VALUES (?, ?, ?, NOW())",
      [id_lantai, pj.shift, pj.nama]
    );

    await conn.commit();
    res.json({ success: true, message: "Lantai + PJ berhasil disimpan" });
  } catch (err) {
    await conn.rollback();
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Shift ini sudah ada untuk lantai tersebut" });
    } else {
      res.status(500).json({ message: "Gagal menambahkan lantai" });
    }
  } finally {
    conn.release();
  }
};

// UPDATE lantai atau PJ
const updateLantai = async (req, res) => {
  const { id } = req.params;
  const { id_gedung, nomor_lantai, pj } = req.body;

  if (!id_gedung || !nomor_lantai || !pj?.nama || !pj?.shift) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query("UPDATE lantai SET id_gedung=?, nomor_lantai=? WHERE id_lantai=?", [
      id_gedung,
      nomor_lantai,
      id,
    ]);

    // cek apakah PJ untuk shift tersebut sudah ada
    const [pjRows] = await conn.query(
      "SELECT id_pj_lantai FROM pj_lantai WHERE id_lantai=? AND shift=?",
      [id, pj.shift]
    );

    if (pjRows.length > 0) {
      await conn.query("UPDATE pj_lantai SET nama=? WHERE id_pj_lantai=?", [
        pj.nama,
        pjRows[0].id_pj_lantai,
      ]);
    } else {
      await conn.query(
        "INSERT INTO pj_lantai (id_lantai, shift, nama, created_at) VALUES (?, ?, ?, NOW())",
        [id, pj.shift, pj.nama]
      );
    }

    await conn.commit();
    res.json({ success: true, message: "Lantai + PJ berhasil diperbarui" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Shift ini sudah ada untuk lantai tersebut" });
    } else {
      res.status(500).json({ message: "Gagal memperbarui lantai" });
    }
  } finally {
    conn.release();
  }
};

const deleteLantai = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM lantai WHERE id_lantai=?", [id]);
    res.json({ success: true, message: "Lantai berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus lantai" });
  }
};

module.exports = { getLantais, addLantai, updateLantai, deleteLantai };
