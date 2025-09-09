const pool = require("../config/db");

// Mapping hari untuk recurrence mingguan & bulanan
const dayMap = {
  Min: 0, // Sunday
  Sen: 1,
  Sel: 2,
  Rab: 3,
  Kam: 4,
  Jum: 5,
  Sab: 6,
};

// ======================= GET AGENDA =======================
const getAgenda = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Ambil agenda expired
    const [expiredAgendas] = await conn.query(`
      SELECT j.*, k.nama_kegiatan, k.pengguna, k.id_kegiatan, k.id_ruangan
      FROM jadwal j
      JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
      WHERE CONCAT(j.tanggal, ' ', j.waktu_selesai) < NOW()
    `);

    // Pindahkan ke histori
    for (const agenda of expiredAgendas) {
      await conn.query(
        `INSERT INTO histori_kegiatan_jadwal
         (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          agenda.id_kegiatan,
          agenda.id_jadwal,
          agenda.nama_kegiatan,
          agenda.pengguna,
          agenda.id_ruangan,
          agenda.tanggal,
          agenda.waktu_mulai,
          agenda.waktu_selesai,
        ]
      );
    }

    // Hapus jadwal expired
    if (expiredAgendas.length > 0) {
      const idsToDelete = expiredAgendas.map((a) => a.id_jadwal);
      await conn.query(`DELETE FROM jadwal WHERE id_jadwal IN (?)`, [idsToDelete]);
    }

    await conn.commit();

    // Ambil agenda aktif
    const [rows] = await conn.query(`
      SELECT 
        j.id_jadwal,
        k.nama_kegiatan,
        k.deskripsi_kegiatan,
        k.pengguna,
        r.id_ruangan,
        r.nama_ruangan,
        l.nomor_lantai,
        g.nama_gedung,
        j.tanggal,
        j.waktu_mulai,
        j.waktu_selesai
      FROM jadwal j
      JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
      JOIN ruangan r ON k.id_ruangan = r.id_ruangan
      JOIN lantai l ON r.id_lantai = l.id_lantai
      JOIN gedung g ON l.id_gedung = g.id_gedung
      ORDER BY j.tanggal ASC, j.waktu_mulai ASC
    `);

    res.json({ data: rows });
  } catch (err) {
    await conn.rollback();
    console.error("Error getAgenda:", err);
    res.status(500).json({ message: "Gagal ambil data agenda" });
  } finally {
    conn.release();
  }
};

// ======================= CREATE AGENDA =======================
const createAgenda = async (req, res) => {
  const {
    nama_kegiatan,
    deskripsi_kegiatan,
    pengguna,
    id_ruangan,
    tanggal,
    waktu_mulai,
    waktu_selesai,
    recurrence_type = "none",
    recurrence_interval = 1,
    recurrence_days = null,
    recurrence_end_date = null,
    recurrence_count = null,
    recurrence_monthly_mode = "date",
    recurrence_monthly_day = null,
    recurrence_monthly_week = null,
    recurrence_monthly_weekday = null,
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ Cek bentrok ruangan
    const [conflicts] = await conn.query(
      `SELECT j.id_jadwal, k.nama_kegiatan, j.tanggal, j.waktu_mulai, j.waktu_selesai
       FROM jadwal j
       JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
       WHERE k.id_ruangan = ?
         AND j.tanggal = ?
         AND (? < j.waktu_selesai AND ? > j.waktu_mulai)`,
      [id_ruangan, tanggal, waktu_mulai, waktu_selesai]
    );

    if (conflicts.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        message: `Ruangan sudah terpakai untuk agenda "${conflicts[0].nama_kegiatan}" pada ${conflicts[0].waktu_mulai} - ${conflicts[0].waktu_selesai}`,
      });
    }

    // Simpan kegiatan
    const [kegiatan] = await conn.query(
      `INSERT INTO kegiatan 
       (nama_kegiatan, deskripsi_kegiatan, pengguna, id_ruangan, recurrence_type, recurrence_interval, recurrence_days, recurrence_end_date, recurrence_count, recurrence_monthly_mode, recurrence_monthly_day, recurrence_monthly_week, recurrence_monthly_weekday) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama_kegiatan,
        deskripsi_kegiatan,
        pengguna,
        id_ruangan,
        recurrence_type,
        recurrence_interval,
        recurrence_days,
        recurrence_end_date,
        recurrence_count,
        recurrence_monthly_mode,
        recurrence_monthly_day,
        recurrence_monthly_week,
        recurrence_monthly_weekday,
      ]
    );

    // Generate event berdasarkan recurrence
    const events = [];
    let startDate = new Date(tanggal);
    const maxCount = recurrence_count ? parseInt(recurrence_count) : Infinity;
    const endDate = recurrence_end_date ? new Date(recurrence_end_date) : null;

    if (recurrence_type === "none") {
      events.push(new Date(startDate));
    } else if (recurrence_type === "daily") {
      let i = 0;
      while (i < maxCount && (!endDate || startDate <= endDate)) {
        events.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + parseInt(recurrence_interval));
        i++;
      }
    } else if (recurrence_type === "weekly") {
      const days = recurrence_days ? recurrence_days.split(",") : [];
      let i = 0;
      let tempDate = new Date(startDate);

      while (i < maxCount && (!endDate || tempDate <= endDate)) {
        for (const d of days) {
          const targetDay = dayMap[d];
          let nextDate = new Date(tempDate);

          while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
          }

          if ((!endDate || nextDate <= endDate) && i < maxCount) {
            events.push(new Date(nextDate));
            i++;
          }
        }
        tempDate.setDate(tempDate.getDate() + parseInt(recurrence_interval) * 7);
      }
    } else if (recurrence_type === "monthly") {
      let i = 0;
      let tempDate = new Date(startDate);

      while (i < maxCount && (!endDate || tempDate <= endDate)) {
        if (recurrence_monthly_mode === "date") {
          // berdasarkan tanggal fix
          const eventDate = new Date(tempDate);
          eventDate.setDate(recurrence_monthly_day || tempDate.getDate());
          events.push(eventDate);
        } else if (recurrence_monthly_mode === "day") {
          // berdasarkan minggu ke-X dan hari tertentu
          const targetDay = dayMap[recurrence_monthly_weekday];
          const firstDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
          let count = 0;
          let eventDate = new Date(firstDay);

          // cari hari pertama dalam bulan
          while (eventDate.getDay() !== targetDay) {
            eventDate.setDate(eventDate.getDate() + 1);
          }

          // maju ke minggu ke-n
          eventDate.setDate(eventDate.getDate() + (recurrence_monthly_week - 1) * 7);

          // kalau minggu terakhir
          if (recurrence_monthly_week === -1) {
            const lastDay = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
            eventDate = new Date(lastDay);
            while (eventDate.getDay() !== targetDay) {
              eventDate.setDate(eventDate.getDate() - 1);
            }
          }

          events.push(eventDate);
        }

        tempDate.setMonth(tempDate.getMonth() + parseInt(recurrence_interval));
        i++;
      }
    }

    // Simpan jadwal
    for (const e of events) {
      const tanggalStr = e.toISOString().slice(0, 10);
      await conn.query(
        `INSERT INTO jadwal 
         (id_kegiatan, tanggal, waktu_mulai, waktu_selesai, created_at, recurrence_type, recurrence_interval, recurrence_days, recurrence_end_date, recurrence_count, recurrence_monthly_mode, recurrence_monthly_day, recurrence_monthly_week, recurrence_monthly_weekday) 
         VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kegiatan.insertId,
          tanggalStr,
          waktu_mulai,
          waktu_selesai,
          recurrence_type,
          recurrence_interval,
          recurrence_days,
          recurrence_end_date,
          recurrence_count,
          recurrence_monthly_mode,
          recurrence_monthly_day,
          recurrence_monthly_week,
          recurrence_monthly_weekday,
        ]
      );
    }

    await conn.commit();
    res.json({ message: "Agenda berhasil ditambahkan dengan perulangan" });
  } catch (err) {
    await conn.rollback();
    console.error("Error createAgenda:", err);
    res.status(500).json({ message: "Gagal tambah agenda" });
  } finally {
    conn.release();
  }
};

// ======================= UPDATE AGENDA =======================
const updateAgenda = async (req, res) => {
  const { id } = req.params;
  const {
    nama_kegiatan,
    deskripsi_kegiatan,
    pengguna,
    id_ruangan,
    tanggal,
    waktu_mulai,
    waktu_selesai,
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ Cek bentrok (kecuali dirinya sendiri)
    const [conflicts] = await conn.query(
      `SELECT j.id_jadwal, k.nama_kegiatan, j.waktu_mulai, j.waktu_selesai
       FROM jadwal j
       JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
       WHERE k.id_ruangan = ?
         AND j.tanggal = ?
         AND j.id_jadwal <> ?
         AND (? < j.waktu_selesai AND ? > j.waktu_mulai)`,
      [id_ruangan, tanggal, id, waktu_mulai, waktu_selesai]
    );

    if (conflicts.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        message: `Tidak bisa update, bentrok dengan agenda "${conflicts[0].nama_kegiatan}" (${conflicts[0].waktu_mulai} - ${conflicts[0].waktu_selesai})`,
      });
    }

    await conn.query(
      `UPDATE kegiatan k 
       JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
       SET k.nama_kegiatan=?, k.deskripsi_kegiatan=?, k.pengguna=?, k.id_ruangan=?,
           j.tanggal=?, j.waktu_mulai=?, j.waktu_selesai=?
       WHERE j.id_jadwal=?`,
      [
        nama_kegiatan,
        deskripsi_kegiatan,
        pengguna,
        id_ruangan,
        tanggal,
        waktu_mulai,
        waktu_selesai,
        id,
      ]
    );

    await conn.commit();
    res.json({ message: "Agenda berhasil diupdate" });
  } catch (err) {
    await conn.rollback();
    console.error("Error updateAgenda:", err);
    res.status(500).json({ message: "Gagal update agenda" });
  } finally {
    conn.release();
  }
};

// ======================= DELETE AGENDA =======================
const deleteAgenda = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[jadwal]] = await conn.query(`SELECT id_kegiatan FROM jadwal WHERE id_jadwal=?`, [id]);
    if (!jadwal) return res.status(404).json({ message: "Agenda tidak ditemukan" });

    await conn.query(`DELETE FROM jadwal WHERE id_jadwal=?`, [id]);

    const [sisa] = await conn.query(`SELECT COUNT(*) AS cnt FROM jadwal WHERE id_kegiatan=?`, [
      jadwal.id_kegiatan,
    ]);

    if (sisa[0].cnt === 0) {
      await conn.query(`DELETE FROM kegiatan WHERE id_kegiatan=?`, [jadwal.id_kegiatan]);
    }

    await conn.commit();
    res.json({ message: "Agenda berhasil dihapus" });
  } catch (err) {
    await conn.rollback();
    console.error("Error deleteAgenda:", err);
    res.status(500).json({ message: "Gagal hapus agenda" });
  } finally {
    conn.release();
  }
};

module.exports = { getAgenda, createAgenda, updateAgenda, deleteAgenda };
