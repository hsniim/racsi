CREATE DATABASE IF NOT EXISTS db_racsi;
USE db_racsi;

-- =======================
-- 1. TABEL ADMIN
-- =======================
CREATE TABLE admin (
    id_admin INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- hash bcrypt/argon2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- 2. TABEL GEDUNG
-- =======================
CREATE TABLE gedung (
    id_gedung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_gedung VARCHAR(50) NOT NULL,
    lokasi_gedung ENUM('jakarta', 'depok') DEFAULT 'jakarta',
    pj_gedung VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- 3. TABEL LANTAI
-- =======================
CREATE TABLE lantai (
    id_lantai INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_gedung INT UNSIGNED NOT NULL,
    nomor_lantai TINYINT NOT NULL,
    pj_lantaipagi VARCHAR(50) NOT NULL,
    pj_lantaisiang VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_lantai_id_gedung ON lantai(id_gedung);

-- =======================
-- 4. TABEL RUANGAN
-- =======================
CREATE TABLE ruangan (
    id_ruangan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_lantai INT UNSIGNED NOT NULL,
    nama_ruangan VARCHAR(50) NOT NULL,
    kapasitas VARCHAR(20) NOT NULL, -- sesuai permintaan
    status ENUM('tidak_digunakan', 'digunakan') DEFAULT 'tidak_digunakan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_lantai) REFERENCES lantai(id_lantai)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_ruangan_id_lantai ON ruangan(id_lantai);

-- =======================
-- 5. TABEL KEGIATAN
-- =======================
CREATE TABLE kegiatan (
    id_kegiatan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_ruangan INT UNSIGNED NOT NULL,
    nama_kegiatan VARCHAR(100) NOT NULL,
    deskripsi_kegiatan TEXT NOT NULL,
    pengguna VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_kegiatan_id_ruangan ON kegiatan(id_ruangan);

-- =======================
-- 6. TABEL JADWAL (hapus id_ruangan karena sudah di kegiatan)
-- =======================
CREATE TABLE jadwal (
    id_jadwal INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_kegiatan INT UNSIGNED NOT NULL,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_kegiatan) REFERENCES kegiatan(id_kegiatan)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_jadwal_tanggal_mulai ON jadwal(tanggal, waktu_mulai);

-- =======================
-- 7. TABEL LOG PEMINJAMAN (riwayat untuk analisis)
-- =======================
CREATE TABLE log_peminjaman (
    id_log INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_kegiatan INT UNSIGNED,
    id_jadwal INT UNSIGNED,
    tanggal_dihapus TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_kegiatan JSON,
    data_jadwal JSON,
    FOREIGN KEY (id_kegiatan) REFERENCES kegiatan(id_kegiatan),
    FOREIGN KEY (id_jadwal) REFERENCES jadwal(id_jadwal)
);
CREATE INDEX idx_log_peminjaman_id_kegiatan ON log_peminjaman(id_kegiatan);
CREATE INDEX idx_log_peminjaman_id_jadwal ON log_peminjaman(id_jadwal);

-- =======================
-- 8. TRIGGER UNTUK LOG
-- =======================
DELIMITER $$

-- Log jika kegiatan dihapus (termasuk yang tidak punya jadwal)
CREATE TRIGGER before_delete_kegiatan
BEFORE DELETE ON kegiatan
FOR EACH ROW
BEGIN
    INSERT INTO log_peminjaman (id_kegiatan, data_kegiatan)
    VALUES (
        OLD.id_kegiatan,
        JSON_OBJECT(
            'id_ruangan', OLD.id_ruangan,
            'nama_kegiatan', OLD.nama_kegiatan,
            'deskripsi_kegiatan', OLD.deskripsi_kegiatan,
            'pengguna', OLD.pengguna,
            'created_at', OLD.created_at
        )
    );
END$$

-- Log jika jadwal dihapus (jadwal akan menyertakan data kegiatan juga)
CREATE TRIGGER before_delete_jadwal
BEFORE DELETE ON jadwal
FOR EACH ROW
BEGIN
    DECLARE ruangan_id INT;
    DECLARE nama_kegiatan_val VARCHAR(100);
    DECLARE deskripsi_val TEXT;
    DECLARE pengguna_val VARCHAR(50);
    DECLARE created_kegiatan TIMESTAMP;

    SELECT k.id_ruangan, k.nama_kegiatan, k.deskripsi_kegiatan, k.pengguna, k.created_at
    INTO ruangan_id, nama_kegiatan_val, deskripsi_val, pengguna_val, created_kegiatan
    FROM kegiatan k
    WHERE k.id_kegiatan = OLD.id_kegiatan;

    INSERT INTO log_peminjaman (id_kegiatan, id_jadwal, data_kegiatan, data_jadwal)
    VALUES (
        OLD.id_kegiatan,
        OLD.id_jadwal,
        JSON_OBJECT(
            'id_ruangan', ruangan_id,
            'nama_kegiatan', nama_kegiatan_val,
            'deskripsi_kegiatan', deskripsi_val,
            'pengguna', pengguna_val,
            'created_at', created_kegiatan
        ),
        JSON_OBJECT(
            'tanggal', OLD.tanggal,
            'waktu_mulai', OLD.waktu_mulai,
            'waktu_selesai', OLD.waktu_selesai,
            'created_at', OLD.created_at
        )
    );
END$$

DELIMITER ;

-- =======================
-- 9. STORED PROCEDURE & EVENT UNTUK BERSIH-BERSIH OTOMATIS
-- =======================
DELIMITER $$

CREATE PROCEDURE cleanup_expired_schedules()
BEGIN
    -- Hapus semua kegiatan yang jadwalnya sudah lewat hari ini
    DELETE FROM kegiatan
    WHERE id_kegiatan IN (
        SELECT id_kegiatan FROM jadwal
        WHERE (tanggal < CURDATE())
           OR (tanggal = CURDATE() AND waktu_selesai < CURTIME())
    );

    -- Update status ruangan yang tidak ada kegiatan aktif menjadi "tidak_digunakan"
    UPDATE ruangan r
    SET status = 'tidak_digunakan'
    WHERE r.id_ruangan NOT IN (
        SELECT DISTINCT id_ruangan FROM kegiatan
    );
END$$

DELIMITER ;

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_every_5min
ON SCHEDULE EVERY 5 MINUTE
STARTS '2025-08-16 00:00:00'
DO CALL cleanup_expired_schedules();
