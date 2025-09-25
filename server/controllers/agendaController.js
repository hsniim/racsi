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

    // Ambil agenda aktif dengan informasi recurrence
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
        j.waktu_selesai,
        k.recurrence_type,
        k.recurrence_interval,
        k.recurrence_days,
        k.recurrence_end_date,
        k.recurrence_count,
        k.recurrence_monthly_mode,
        k.recurrence_monthly_day,
        k.recurrence_monthly_week,
        k.recurrence_monthly_weekday
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
    res.status(500).json({ 
      message: "Gagal ambil data agenda",
      error: err.message,
      sqlState: err.sqlState,
      code: err.code
    });
  } finally {
    conn.release();
  }
};

// ======================= CREATE AGENDA =======================
const createAgenda = async (req, res) => {
  console.log("=== CREATE AGENDA REQUEST ===");
  console.log("Request body:", req.body);
  console.log("User from token:", req.user);

  let {
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

  // Convert empty strings to null for database compatibility
  recurrence_end_date = recurrence_end_date === '' ? null : recurrence_end_date;
  recurrence_count = recurrence_count === '' ? null : recurrence_count;
  recurrence_days = recurrence_days === '' ? null : recurrence_days;
  recurrence_monthly_day = recurrence_monthly_day === '' ? null : recurrence_monthly_day;
  recurrence_monthly_week = recurrence_monthly_week === '' ? null : recurrence_monthly_week;
  recurrence_monthly_weekday = recurrence_monthly_weekday === '' ? null : recurrence_monthly_weekday;

  // Validasi input dasar
  if (!nama_kegiatan || !deskripsi_kegiatan || !pengguna || !id_ruangan || !tanggal || !waktu_mulai || !waktu_selesai) {
    return res.status(400).json({
      message: "Field wajib tidak lengkap",
      required: ["nama_kegiatan", "deskripsi_kegiatan", "pengguna", "id_ruangan", "tanggal", "waktu_mulai", "waktu_selesai"]
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    console.log("Database connection established");

    // Cek apakah ruangan exists
    console.log("Checking if room exists with id_ruangan:", id_ruangan);
    const [roomCheck] = await conn.query("SELECT id_ruangan FROM ruangan WHERE id_ruangan = ?", [id_ruangan]);
    
    if (roomCheck.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        message: `Ruangan dengan ID ${id_ruangan} tidak ditemukan`
      });
    }

    // Simpan kegiatan dengan semua field recurrence sesuai schema
    const kegiatanQuery = `
      INSERT INTO kegiatan 
      (nama_kegiatan, deskripsi_kegiatan, pengguna, id_ruangan, recurrence_type, recurrence_interval, recurrence_days, recurrence_end_date, recurrence_count, recurrence_monthly_mode, recurrence_monthly_day, recurrence_monthly_week, recurrence_monthly_weekday) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    console.log("Executing kegiatan query:", kegiatanQuery);
    console.log("With values:", [nama_kegiatan, deskripsi_kegiatan, pengguna, id_ruangan, recurrence_type, recurrence_interval, recurrence_days, recurrence_end_date, recurrence_count, recurrence_monthly_mode, recurrence_monthly_day, recurrence_monthly_week, recurrence_monthly_weekday]);
    
    const [kegiatan] = await conn.query(kegiatanQuery, [
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
    ]);

    console.log("Kegiatan created with ID:", kegiatan.insertId);

    // Generate event berdasarkan recurrence
    const events = [];
    let startDate = new Date(tanggal);
    const maxCount = recurrence_count ? parseInt(recurrence_count) : (recurrence_type === "none" ? 1 : 50); // Default max untuk recurring
    const endDate = recurrence_end_date ? new Date(recurrence_end_date) : null;

    console.log("Generating events for recurrence_type:", recurrence_type);

    if (recurrence_type === "none" || !recurrence_type) {
      events.push(new Date(startDate));
      console.log("Single event created");
    } else if (recurrence_type === "daily") {
      let i = 0;
      let currentDate = new Date(startDate);
      while (i < maxCount && (!endDate || currentDate <= endDate)) {
        events.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + parseInt(recurrence_interval));
        i++;
      }
      console.log(`Created ${events.length} daily events`);
    } else if (recurrence_type === "weekly") {
      const days = recurrence_days ? recurrence_days.split(",") : [];
      console.log("Weekly recurrence days:", days);
      
      if (days.length === 0) {
        // Jika tidak ada hari yang dipilih, gunakan hari dari tanggal awal
        const dayName = Object.keys(dayMap).find(key => dayMap[key] === startDate.getDay());
        if (dayName) days.push(dayName);
      }
      
      let weekCounter = 0;
      let currentWeekStart = new Date(startDate);
      // Set ke hari Minggu dari minggu startDate
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      
      while (events.length < maxCount && (!endDate || currentWeekStart <= endDate)) {
        for (const dayName of days) {
          const targetDay = dayMap[dayName];
          const eventDate = new Date(currentWeekStart);
          eventDate.setDate(currentWeekStart.getDate() + targetDay);
          
          // Pastikan event date tidak sebelum start date dan tidak melebihi end date
          if (eventDate >= startDate && (!endDate || eventDate <= endDate) && events.length < maxCount) {
            events.push(new Date(eventDate));
          }
        }
        
        // Pindah ke minggu berikutnya berdasarkan interval
        currentWeekStart.setDate(currentWeekStart.getDate() + (parseInt(recurrence_interval) * 7));
        weekCounter++;
      }
      console.log(`Created ${events.length} weekly events`);
    } else if (recurrence_type === "monthly") {
      let i = 0;
      let currentDate = new Date(startDate);

      while (i < maxCount && (!endDate || currentDate <= endDate)) {
        let eventDate = new Date(currentDate);
        
        if (recurrence_monthly_mode === "date") {
          const targetDay = recurrence_monthly_day ? parseInt(recurrence_monthly_day) : startDate.getDate();
          eventDate.setDate(targetDay);
          
          // Handle kasus dimana bulan tidak memiliki tanggal tersebut (misal: 31 Feb)
          if (eventDate.getMonth() !== currentDate.getMonth()) {
            eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of month
          }
        } else if (recurrence_monthly_mode === "day" && recurrence_monthly_weekday && recurrence_monthly_week) {
          const targetDay = dayMap[recurrence_monthly_weekday];
          const weekNum = parseInt(recurrence_monthly_week);
          
          if (weekNum === -1) {
            // Minggu terakhir
            eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of month
            while (eventDate.getDay() !== targetDay) {
              eventDate.setDate(eventDate.getDate() - 1);
            }
          } else {
            // Minggu ke-N
            eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            // Cari hari pertama yang sesuai
            while (eventDate.getDay() !== targetDay) {
              eventDate.setDate(eventDate.getDate() + 1);
            }
            // Tambah (weekNum - 1) * 7 hari
            eventDate.setDate(eventDate.getDate() + ((weekNum - 1) * 7));
            
            // Pastikan masih dalam bulan yang sama
            if (eventDate.getMonth() !== currentDate.getMonth()) {
              // Skip bulan ini jika tanggal tidak valid
              currentDate.setMonth(currentDate.getMonth() + parseInt(recurrence_interval));
              continue;
            }
          }
        }

        if (eventDate >= startDate && (!endDate || eventDate <= endDate)) {
          events.push(new Date(eventDate));
        }

        currentDate.setMonth(currentDate.getMonth() + parseInt(recurrence_interval));
        i++;
      }
      console.log(`Created ${events.length} monthly events`);
    }

    // Cek konflik untuk semua event yang akan dibuat
    for (let i = 0; i < events.length; i++) {
      const eventDate = events[i];
      const tanggalStr = eventDate.toISOString().slice(0, 10);
      
      const [conflicts] = await conn.query(
        `SELECT j.id_jadwal, k.nama_kegiatan, j.tanggal, j.waktu_mulai, j.waktu_selesai
         FROM jadwal j
         JOIN kegiatan k ON j.id_kegiatan = k.id_kegiatan
         WHERE k.id_ruangan = ?
           AND j.tanggal = ?
           AND (? < j.waktu_selesai AND ? > j.waktu_mulai)`,
        [id_ruangan, tanggalStr, waktu_mulai, waktu_selesai]
      );

      if (conflicts.length > 0) {
        await conn.rollback();
        return res.status(400).json({
          message: `Ruangan sudah terpakai pada tanggal ${tanggalStr} untuk agenda "${conflicts[0].nama_kegiatan}" pada ${conflicts[0].waktu_mulai} - ${conflicts[0].waktu_selesai}`,
        });
      }
    }

    // Simpan jadwal dengan semua field recurrence sesuai schema
    console.log("Saving jadwal entries...");
    const jadwalQuery = `
      INSERT INTO jadwal 
      (id_kegiatan, tanggal, waktu_mulai, waktu_selesai, created_at, recurrence_type, recurrence_interval, recurrence_days, recurrence_end_date, recurrence_count, recurrence_monthly_mode, recurrence_monthly_day, recurrence_monthly_week, recurrence_monthly_weekday) 
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const tanggalStr = e.toISOString().slice(0, 10);
      
      console.log(`Creating jadwal ${i + 1}/${events.length} for date:`, tanggalStr);
      
      // Convert values for jadwal insert
      const jadwalValues = [
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
      ];
      
      await conn.query(jadwalQuery, jadwalValues);
    }

    await conn.commit();
    console.log("=== CREATE AGENDA SUCCESS ===");
    
    res.json({ 
      message: `Agenda berhasil ditambahkan dengan ${events.length} jadwal`,
      created_events: events.length,
      kegiatan_id: kegiatan.insertId
    });
  } catch (err) {
    await conn.rollback();
    console.error("=== CREATE AGENDA ERROR ===");
    console.error("Error details:", err);
    console.error("Stack:", err.stack);
    
    res.status(500).json({ 
      message: "Gagal tambah agenda",
      error: err.message,
      sqlState: err.sqlState,
      code: err.code,
      errno: err.errno
    });
  } finally {
    conn.release();
    console.log("Database connection released");
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

    // Cek bentrok (kecuali dirinya sendiri)
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
    res.status(500).json({ 
      message: "Gagal update agenda",
      error: err.message
    });
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
    res.status(500).json({ 
      message: "Gagal hapus agenda",
      error: err.message
    });
  } finally {
    conn.release();
  }
};

module.exports = { getAgenda, createAgenda, updateAgenda, deleteAgenda };