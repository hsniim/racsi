-- =====================================================
-- DATABASE UTAMA
-- =====================================================
CREATE DATABASE IF NOT EXISTS db_racsi;
USE db_racsi;

-- 1) ADMIN
CREATE TABLE IF NOT EXISTS admin (
    id_admin INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) GEDUNG
CREATE TABLE IF NOT EXISTS gedung (
    id_gedung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_gedung VARCHAR(50) NOT NULL,
    lokasi_gedung ENUM('jakarta','depok') DEFAULT 'jakarta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pj_gedung (
    id_pj_gedung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_gedung INT UNSIGNED NOT NULL,
    nama VARCHAR(30) NOT NULL,
    no_telp VARCHAR(30) NOT NULL,
    link_peminjaman VARCHAR(100) NOT NULL,
    qrcodepath_pinjam VARCHAR(200) NOT NULL,
    qrcodepath_kontak VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pj_gedung FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung) ON DELETE CASCADE,
    INDEX idx_pj_gedung (id_gedung)
);

-- 3) LANTAI
CREATE TABLE IF NOT EXISTS lantai (
    id_lantai INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_gedung INT UNSIGNED NOT NULL,
    nomor_lantai TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lantai_gedung
        FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- Indeks FK
CREATE INDEX idx_lantai_id_gedung ON lantai(id_gedung);

CREATE TABLE IF NOT EXISTS pj_lantai (
    id_pj_lantai INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_lantai INT UNSIGNED NOT NULL,
    shift ENUM('pagi','siang','malam') NOT NULL,
    nama VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pj_lantai FOREIGN KEY (id_lantai) REFERENCES lantai(id_lantai) ON DELETE CASCADE,
    INDEX idx_pj_lantai (id_lantai)
);

CREATE TABLE IF NOT EXISTS tv_device (
    id_device INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_device VARCHAR(100) NOT NULL,
    id_gedung INT UNSIGNED NOT NULL,
    id_lantai INT UNSIGNED NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tvdevice_gedung FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tvdevice_lantai FOREIGN KEY (id_lantai) REFERENCES lantai(id_lantai)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4) RUANGAN
CREATE TABLE IF NOT EXISTS ruangan (
    id_ruangan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_lantai INT UNSIGNED NOT NULL,
    nama_ruangan VARCHAR(30) NOT NULL,
    kapasitas SMALLINT NOT NULL,
    status ENUM('tidak_digunakan','digunakan') DEFAULT 'tidak_digunakan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ruangan_lantai
        FOREIGN KEY (id_lantai) REFERENCES lantai(id_lantai)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- Indeks FK
CREATE INDEX idx_ruangan_id_lantai ON ruangan(id_lantai);

-- 5) KEGIATAN
CREATE TABLE IF NOT EXISTS kegiatan (
    id_kegiatan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_ruangan INT UNSIGNED NOT NULL,
    nama_kegiatan VARCHAR(50) NOT NULL,
    deskripsi_kegiatan TEXT NOT NULL,
    pengguna VARCHAR(30) NOT NULL,
    recurrence_type ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    recurrence_interval INT DEFAULT 1,
    recurrence_days VARCHAR(50) NULL,
    recurrence_end_date DATE NULL,
    recurrence_count INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kegiatan_ruangan
        FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- Indeks FK
CREATE INDEX idx_kegiatan_id_ruangan ON kegiatan(id_ruangan);

-- 6) JADWAL
CREATE TABLE IF NOT EXISTS jadwal (
    id_jadwal INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_kegiatan INT UNSIGNED NOT NULL,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    recurrence_type ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    recurrence_interval INT DEFAULT 1,
    recurrence_days VARCHAR(50) NULL,
    recurrence_end_date DATE NULL,
    recurrence_count INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jadwal_kegiatan
        FOREIGN KEY (id_kegiatan) REFERENCES kegiatan(id_kegiatan)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- Indeks untuk join & waktu
CREATE INDEX idx_jadwal_id_kegiatan ON jadwal(id_kegiatan);
CREATE INDEX idx_jadwal_tanggal_mulai ON jadwal(tanggal, waktu_mulai);
CREATE INDEX idx_jadwal_tanggal_selesai ON jadwal(tanggal, waktu_selesai);

-- 7) LOG AKTIVITAS
CREATE TABLE IF NOT EXISTS log_aktivitas (
    id_log BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_tabel VARCHAR(30) NOT NULL,
    aksi ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    data_lama JSON NULL,
    data_baru JSON NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Indeks analitik & housekeeping
CREATE INDEX idx_log_waktu ON log_aktivitas(waktu);
CREATE INDEX idx_log_nama_tabel ON log_aktivitas(nama_tabel);

-- 8) HISTORI (gabungan kegiatan + jadwal; di DB utama, penampung sementara)
CREATE TABLE IF NOT EXISTS histori_kegiatan_jadwal (
    id_histori BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_kegiatan INT UNSIGNED,
    id_jadwal INT UNSIGNED,
    nama_kegiatan VARCHAR(50),
    pengguna VARCHAR(30),
    id_ruangan INT UNSIGNED,
    tanggal DATE,
    waktu_mulai TIME,
    waktu_selesai TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    migrated TINYINT(1) DEFAULT 0
);
-- Hindari duplikasi saat event berulang
CREATE UNIQUE INDEX uq_histori_id_jadwal ON histori_kegiatan_jadwal(id_jadwal);
-- Indeks berguna untuk laporan
CREATE INDEX idx_histori_tanggal ON histori_kegiatan_jadwal(tanggal);
CREATE INDEX idx_histori_id_ruangan ON histori_kegiatan_jadwal(id_ruangan);
CREATE INDEX idx_histori_created_at ON histori_kegiatan_jadwal(created_at);

-- =====================================================
-- DATABASE ARSIP
-- =====================================================
CREATE DATABASE IF NOT EXISTS db_racsi_arsip;
USE db_racsi_arsip;

-- Arsip histori (retensi 10 tahun)
CREATE TABLE IF NOT EXISTS histori_kegiatan_jadwal_arsip (
    id_arsip BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_kegiatan INT UNSIGNED,
    id_jadwal INT UNSIGNED,
    nama_kegiatan VARCHAR(100),
    pengguna VARCHAR(50),
    id_ruangan INT UNSIGNED,
    tanggal DATE,
    waktu_mulai TIME,
    waktu_selesai TIME,
    waktu_arsip TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_arsip_id_jadwal ON histori_kegiatan_jadwal_arsip(id_jadwal);
CREATE INDEX idx_arsip_waktu ON histori_kegiatan_jadwal_arsip(waktu_arsip);

-- (Opsional) Arsip log kalau suatu saat ingin dipindah juga
CREATE TABLE IF NOT EXISTS log_aktivitas_arsip (
    id_log BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_tabel VARCHAR(50) NOT NULL,
    aksi ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    data_lama JSON NULL,
    data_baru JSON NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_log_arsip_waktu ON log_aktivitas_arsip(waktu);

-- =====================================================
-- KEMBALI KE DB UTAMA UNTUK EVENT & TRIGGER
-- =====================================================
USE db_racsi;

-- ==========================================
-- TRIGGER: STATUS RUANGAN DARI JADWAL
-- ==========================================
DELIMITER $$

-- Saat ada jadwal baru, set ruangan=digunakan
CREATE TRIGGER trg_jadwal_after_insert
AFTER INSERT ON jadwal
FOR EACH ROW
BEGIN
    UPDATE ruangan r
    JOIN kegiatan k ON k.id_ruangan = r.id_ruangan
    SET r.status = 'digunakan'
    WHERE k.id_kegiatan = NEW.id_kegiatan;
END$$

-- Saat jadwal dihapus, kalau sudah tidak ada jadwal lain di ruangan tsb → set tidak_digunakan
CREATE TRIGGER trg_jadwal_after_delete
AFTER DELETE ON jadwal
FOR EACH ROW
BEGIN
    DECLARE v_ruangan INT;

    SELECT k.id_ruangan INTO v_ruangan
    FROM kegiatan k
    WHERE k.id_kegiatan = OLD.id_kegiatan;

    IF v_ruangan IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM jadwal j
            JOIN kegiatan k2 ON k2.id_kegiatan = j.id_kegiatan
            WHERE k2.id_ruangan = v_ruangan
        ) THEN
            UPDATE ruangan SET status = 'tidak_digunakan'
            WHERE id_ruangan = v_ruangan;
        END IF;
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- TRIGGER: LOG AKTIVITAS (5 tabel utama)
-- ==========================================
DELIMITER $$

-- GEDUNG (FIXED - menghapus referensi pj_gedung yang tidak ada)
CREATE TRIGGER log_gedung_ins AFTER INSERT ON gedung
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_baru)
  VALUES ('gedung','INSERT', JSON_OBJECT('id_gedung',NEW.id_gedung,'nama_gedung',NEW.nama_gedung,'lokasi_gedung',NEW.lokasi_gedung));
END$$

CREATE TRIGGER log_gedung_upd AFTER UPDATE ON gedung
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama,data_baru)
  VALUES ('gedung','UPDATE',
          JSON_OBJECT('id_gedung',OLD.id_gedung,'nama_gedung',OLD.nama_gedung,'lokasi_gedung',OLD.lokasi_gedung),
          JSON_OBJECT('id_gedung',NEW.id_gedung,'nama_gedung',NEW.nama_gedung,'lokasi_gedung',NEW.lokasi_gedung));
END$$

CREATE TRIGGER log_gedung_del AFTER DELETE ON gedung
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama)
  VALUES ('gedung','DELETE', JSON_OBJECT('id_gedung',OLD.id_gedung,'nama_gedung',OLD.nama_gedung,'lokasi_gedung',OLD.lokasi_gedung));
END$$

-- LANTAI
CREATE TRIGGER log_lantai_ins AFTER INSERT ON lantai
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_baru)
  VALUES ('lantai','INSERT', JSON_OBJECT('id_lantai',NEW.id_lantai,'id_gedung',NEW.id_gedung,'nomor_lantai',NEW.nomor_lantai));
END$$
CREATE TRIGGER log_lantai_upd AFTER UPDATE ON lantai
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama,data_baru)
  VALUES ('lantai','UPDATE',
          JSON_OBJECT('id_lantai',OLD.id_lantai,'id_gedung',OLD.id_gedung,'nomor_lantai',OLD.nomor_lantai),
          JSON_OBJECT('id_lantai',NEW.id_lantai,'id_gedung',NEW.id_gedung,'nomor_lantai',NEW.nomor_lantai));
END$$
CREATE TRIGGER log_lantai_del AFTER DELETE ON lantai
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama)
  VALUES ('lantai','DELETE', JSON_OBJECT('id_lantai',OLD.id_lantai,'id_gedung',OLD.id_gedung,'nomor_lantai',OLD.nomor_lantai));
END$$

-- RUANGAN
CREATE TRIGGER log_ruangan_ins AFTER INSERT ON ruangan
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_baru)
  VALUES ('ruangan','INSERT', JSON_OBJECT('id_ruangan',NEW.id_ruangan,'id_lantai',NEW.id_lantai,'nama_ruangan',NEW.nama_ruangan,'kapasitas',NEW.kapasitas,'status',NEW.status));
END$$
CREATE TRIGGER log_ruangan_upd AFTER UPDATE ON ruangan
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama,data_baru)
  VALUES ('ruangan','UPDATE',
          JSON_OBJECT('id_ruangan',OLD.id_ruangan,'id_lantai',OLD.id_lantai,'nama_ruangan',OLD.nama_ruangan,'kapasitas',OLD.kapasitas,'status',OLD.status),
          JSON_OBJECT('id_ruangan',NEW.id_ruangan,'id_lantai',NEW.id_lantai,'nama_ruangan',NEW.nama_ruangan,'kapasitas',NEW.kapasitas,'status',NEW.status));
END$$
CREATE TRIGGER log_ruangan_del AFTER DELETE ON ruangan
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama)
  VALUES ('ruangan','DELETE', JSON_OBJECT('id_ruangan',OLD.id_ruangan,'id_lantai',OLD.id_lantai,'nama_ruangan',OLD.nama_ruangan,'kapasitas',OLD.kapasitas,'status',OLD.status));
END$$

-- KEGIATAN
CREATE TRIGGER log_kegiatan_ins AFTER INSERT ON kegiatan
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_baru)
  VALUES ('kegiatan','INSERT', JSON_OBJECT('id_kegiatan',NEW.id_kegiatan,'id_ruangan',NEW.id_ruangan,'nama_kegiatan',NEW.nama_kegiatan,'deskripsi_kegiatan',NEW.deskripsi_kegiatan,'pengguna',NEW.pengguna));
END$$
CREATE TRIGGER log_kegiatan_upd AFTER UPDATE ON kegiatan
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama,data_baru)
  VALUES ('kegiatan','UPDATE',
          JSON_OBJECT('id_kegiatan',OLD.id_kegiatan,'id_ruangan',OLD.id_ruangan,'nama_kegiatan',OLD.nama_kegiatan,'deskripsi_kegiatan',OLD.deskripsi_kegiatan,'pengguna',OLD.pengguna),
          JSON_OBJECT('id_kegiatan',NEW.id_kegiatan,'id_ruangan',NEW.id_ruangan,'nama_kegiatan',NEW.nama_kegiatan,'deskripsi_kegiatan',NEW.deskripsi_kegiatan,'pengguna',NEW.pengguna));
END$$
CREATE TRIGGER log_kegiatan_del AFTER DELETE ON kegiatan
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama)
  VALUES ('kegiatan','DELETE', JSON_OBJECT('id_kegiatan',OLD.id_kegiatan,'id_ruangan',OLD.id_ruangan,'nama_kegiatan',OLD.nama_kegiatan,'deskripsi_kegiatan',OLD.deskripsi_kegiatan,'pengguna',OLD.pengguna));
END$$

-- JADWAL
CREATE TRIGGER log_jadwal_ins AFTER INSERT ON jadwal
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_baru)
  VALUES ('jadwal','INSERT', JSON_OBJECT('id_jadwal',NEW.id_jadwal,'id_kegiatan',NEW.id_kegiatan,'tanggal',NEW.tanggal,'waktu_mulai',NEW.waktu_mulai,'waktu_selesai',NEW.waktu_selesai));
END$$
CREATE TRIGGER log_jadwal_upd AFTER UPDATE ON jadwal
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama,data_baru)
  VALUES ('jadwal','UPDATE',
          JSON_OBJECT('id_jadwal',OLD.id_jadwal,'id_kegiatan',OLD.id_kegiatan,'tanggal',OLD.tanggal,'waktu_mulai',OLD.waktu_mulai,'waktu_selesai',OLD.waktu_selesai),
          JSON_OBJECT('id_jadwal',NEW.id_jadwal,'id_kegiatan',NEW.id_kegiatan,'tanggal',NEW.tanggal,'waktu_mulai',NEW.waktu_mulai,'waktu_selesai',NEW.waktu_selesai));
END$$
CREATE TRIGGER log_jadwal_del AFTER DELETE ON jadwal
FOR EACH ROW BEGIN
  INSERT INTO log_aktivitas(nama_tabel,aksi,data_lama)
  VALUES ('jadwal','DELETE', JSON_OBJECT('id_jadwal',OLD.id_jadwal,'id_kegiatan',OLD.id_kegiatan,'tanggal',OLD.tanggal,'waktu_mulai',OLD.waktu_mulai,'waktu_selesai',OLD.waktu_selesai));
END$$

DELIMITER ;

-- =====================================================
-- EVENT (Scheduler)
-- =====================================================

-- Hidupkan event scheduler (butuh SUPER / SYSTEM_VARIABLES_ADMIN)
-- SET GLOBAL event_scheduler = ON;

-- =====================================================
-- EVENT SCHEDULER TEROPTIMASI
-- =====================================================

-- EVENT A: TIAP 5 MENIT - pindah jadwal selesai ke histori (di DB utama)
DELIMITER $$

DROP EVENT IF EXISTS ev_pindah_ke_histori$$

CREATE EVENT ev_pindah_ke_histori
ON SCHEDULE EVERY 5 MINUTE
STARTS CURRENT_TIMESTAMP
COMMENT 'Pindahkan jadwal selesai ke histori setiap 5 menit'
DO
BEGIN
    DECLARE v_affected_rows INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        -- Log error jika diperlukan
        INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
        VALUES ('event_error', 'INSERT', JSON_OBJECT('event', 'ev_pindah_ke_histori', 'error_time', NOW()));
    END;

    START TRANSACTION;
    
    -- Hanya proses jadwal yang benar-benar sudah selesai (dengan buffer 1 menit)
    INSERT IGNORE INTO histori_kegiatan_jadwal
    (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai)
    SELECT k.id_kegiatan, j.id_jadwal, k.nama_kegiatan, k.pengguna, k.id_ruangan,
           j.tanggal, j.waktu_mulai, j.waktu_selesai
    FROM jadwal j
    JOIN kegiatan k ON k.id_kegiatan = j.id_kegiatan
    WHERE TIMESTAMP(j.tanggal, j.waktu_selesai) < DATE_SUB(NOW(), INTERVAL 1 MINUTE);

    -- Cek berapa banyak yang diinsert
    SELECT ROW_COUNT() INTO v_affected_rows;

    -- Hanya hapus jika insert berhasil
    IF v_affected_rows > 0 THEN
        -- Hapus jadwal yang sudah dipindah ke histori
        DELETE j FROM jadwal j
        WHERE TIMESTAMP(j.tanggal, j.waktu_selesai) < DATE_SUB(NOW(), INTERVAL 1 MINUTE);

        -- Hapus kegiatan yatim (yang tidak punya jadwal lagi)
        DELETE k FROM kegiatan k
        LEFT JOIN jadwal j ON k.id_kegiatan = j.id_kegiatan
        WHERE j.id_kegiatan IS NULL;
    END IF;

    COMMIT;
END$$

DELIMITER ;

-- EVENT B: BULANAN (tgl 1 jam 02:00) - migrasi histori ke DB arsip
DELIMITER $$

DROP EVENT IF EXISTS ev_migrasi_ke_arsip$$

CREATE EVENT ev_migrasi_ke_arsip
ON SCHEDULE EVERY 1 MONTH
STARTS TIMESTAMP(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01 02:00:00'))
COMMENT 'Migrasi histori ke database arsip setiap bulan'
DO
BEGIN
    DECLARE v_batch_size INT DEFAULT 1000;
    DECLARE v_total_migrated INT DEFAULT 0;
    DECLARE v_current_batch INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
        VALUES ('event_error', 'INSERT', JSON_OBJECT('event', 'ev_migrasi_ke_arsip', 'error_time', NOW()));
    END;

    -- Proses dalam batch untuk menghindari lock terlalu lama
    migration_loop: LOOP
        START TRANSACTION;
        
        -- Pindahkan batch histori yang belum dimigrasi
        INSERT IGNORE INTO db_racsi_arsip.histori_kegiatan_jadwal_arsip
        (id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, tanggal, waktu_mulai, waktu_selesai)
        SELECT id_kegiatan, id_jadwal, nama_kegiatan, pengguna, id_ruangan, 
               tanggal, waktu_mulai, waktu_selesai
        FROM histori_kegiatan_jadwal
        WHERE migrated = 0 
        ORDER BY id_histori
        LIMIT v_batch_size;

        SELECT ROW_COUNT() INTO v_current_batch;
        SET v_total_migrated = v_total_migrated + v_current_batch;

        -- Tandai sebagai migrated
        UPDATE histori_kegiatan_jadwal 
        SET migrated = 1 
        WHERE migrated = 0 
        ORDER BY id_histori
        LIMIT v_batch_size;

        COMMIT;
        
        -- Keluar dari loop jika batch terakhir < batch_size
        IF v_current_batch < v_batch_size THEN
            LEAVE migration_loop;
        END IF;
        
        -- Sleep sebentar untuk mengurangi beban
        DO SLEEP(0.1);
    END LOOP;

    -- Bersihkan data yang sudah dimigrasi (dalam batch)
    cleanup_loop: LOOP
        START TRANSACTION;
        
        DELETE FROM histori_kegiatan_jadwal 
        WHERE migrated = 1 
        LIMIT v_batch_size;
        
        SELECT ROW_COUNT() INTO v_current_batch;
        COMMIT;
        
        IF v_current_batch < v_batch_size THEN
            LEAVE cleanup_loop;
        END IF;
        
        DO SLEEP(0.1);
    END LOOP;

    -- Log hasil migrasi
    INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
    VALUES ('event_success', 'INSERT', 
            JSON_OBJECT('event', 'ev_migrasi_ke_arsip', 
                       'total_migrated', v_total_migrated, 
                       'completion_time', NOW()));
END$$

DELIMITER ;

-- EVENT C: TAHUNAN (1 Jan 03:00) - hapus arsip > 10 tahun
DELIMITER $$

DROP EVENT IF EXISTS ev_hapus_arsip_lama$$

CREATE EVENT ev_hapus_arsip_lama
ON SCHEDULE EVERY 1 YEAR
STARTS TIMESTAMP(CONCAT(YEAR(NOW()) + 1, '-01-01 03:00:00'))
COMMENT 'Hapus data arsip yang lebih dari 10 tahun'
DO
BEGIN
    DECLARE v_batch_size INT DEFAULT 1000;
    DECLARE v_total_deleted INT DEFAULT 0;
    DECLARE v_current_batch INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
        VALUES ('event_error', 'INSERT', JSON_OBJECT('event', 'ev_hapus_arsip_lama', 'error_time', NOW()));
    END;

    -- Hapus arsip histori > 10 tahun dalam batch
    delete_histori_loop: LOOP
        START TRANSACTION;
        
        DELETE FROM db_racsi_arsip.histori_kegiatan_jadwal_arsip
        WHERE waktu_arsip < DATE_SUB(NOW(), INTERVAL 10 YEAR)
        LIMIT v_batch_size;
        
        SELECT ROW_COUNT() INTO v_current_batch;
        SET v_total_deleted = v_total_deleted + v_current_batch;
        COMMIT;
        
        IF v_current_batch < v_batch_size THEN
            LEAVE delete_histori_loop;
        END IF;
        
        DO SLEEP(0.1);
    END LOOP;

    -- Hapus arsip log > 10 tahun dalam batch (jika ada)
    delete_log_loop: LOOP
        START TRANSACTION;
        
        DELETE FROM db_racsi_arsip.log_aktivitas_arsip
        WHERE waktu < DATE_SUB(NOW(), INTERVAL 10 YEAR)
        LIMIT v_batch_size;
        
        SELECT ROW_COUNT() INTO v_current_batch;
        COMMIT;
        
        IF v_current_batch < v_batch_size THEN
            LEAVE delete_log_loop;
        END IF;
        
        DO SLEEP(0.1);
    END LOOP;

    -- Log hasil pembersihan
    INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
    VALUES ('event_success', 'INSERT', 
            JSON_OBJECT('event', 'ev_hapus_arsip_lama', 
                       'total_deleted', v_total_deleted, 
                       'completion_time', NOW()));
END$$

DELIMITER ;

-- EVENT D: SETIAP 6 BULAN - bersihkan log_aktivitas utama > 6 bulan
DELIMITER $$

DROP EVENT IF EXISTS ev_bersihkan_log_utama$$

CREATE EVENT ev_bersihkan_log_utama
ON SCHEDULE EVERY 6 MONTH
STARTS '2025-09-01 01:00:00'  -- Mulai 1 September 2025, kemudian setiap 6 bulan
COMMENT 'Bersihkan log aktivitas lama setiap 6 bulan'
DO
BEGIN
    DECLARE v_batch_size INT DEFAULT 2000;
    DECLARE v_total_deleted INT DEFAULT 0;
    DECLARE v_current_batch INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
        VALUES ('event_error', 'INSERT', JSON_OBJECT('event', 'ev_bersihkan_log_utama', 'error_time', NOW()));
    END;

    -- Hapus log lama dalam batch (data lebih dari 6 bulan)
    delete_loop: LOOP
        START TRANSACTION;
        
        DELETE FROM log_aktivitas
        WHERE waktu < DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND nama_tabel NOT IN ('event_error', 'event_success') -- Preserve event logs
        LIMIT v_batch_size;
        
        SELECT ROW_COUNT() INTO v_current_batch;
        SET v_total_deleted = v_total_deleted + v_current_batch;
        COMMIT;
        
        IF v_current_batch < v_batch_size THEN
            LEAVE delete_loop;
        END IF;
        
        DO SLEEP(0.1);
    END LOOP;

    -- Log hasil pembersihan
    INSERT INTO log_aktivitas(nama_tabel, aksi, data_baru) 
    VALUES ('event_success', 'INSERT', 
            JSON_OBJECT('event', 'ev_bersihkan_log_utama', 
                       'total_deleted', v_total_deleted, 
                       'completion_time', NOW()));
END$$

DELIMITER ;

-- =====================================================
-- UTILITY: CEK STATUS EVENT
-- =====================================================

-- Query untuk monitoring event
/*
SELECT 
    event_name,
    event_definition,
    interval_value,
    interval_field,
    starts,
    status,
    last_executed,
    event_comment
FROM INFORMATION_SCHEMA.EVENTS 
WHERE event_schema = 'db_racsi'
ORDER BY event_name;
*/