CREATE DATABASE IF NOT EXISTS db_racsi;
USE db_racsi;

-- =======================
-- TABEL ADMIN
-- =======================
CREATE TABLE admin (
    id_admin INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- untuk hash bcrypt/argon2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- TABEL GEDUNG
-- =======================
CREATE TABLE gedung (
    id_gedung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_gedung VARCHAR(50) NOT NULL,
    lokasi_gedung ENUM('jakarta', 'depok') DEFAULT 'jakarta',
    pj_gedung VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- TABEL LANTAI
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
-- TABEL RUANGAN
-- =======================
CREATE TABLE ruangan (
    id_ruangan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_lantai INT UNSIGNED NOT NULL,
    nama_ruangan VARCHAR(50) NOT NULL,
    kapasitas VARCHAR(20) NOT NULL,
    status ENUM('tidak_digunakan', 'digunakan') DEFAULT 'tidak_digunakan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_lantai) REFERENCES lantai(id_lantai)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_ruangan_id_lantai ON ruangan(id_lantai);

-- =======================
-- TABEL KEGIATAN
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
-- TABEL JADWAL
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

CREATE INDEX idx_jadwal_id_kegiatan ON jadwal(id_kegiatan);

-- =======================
-- TABEL LOG PEMINJAMAN
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

-- =======================
-- TRIGGER UNTUK LOG
-- =======================
DELIMITER $$

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

CREATE TRIGGER before_delete_jadwal
BEFORE DELETE ON jadwal
FOR EACH ROW
BEGIN
    INSERT INTO log_peminjaman (id_kegiatan, id_jadwal, data_jadwal)
    VALUES (
        OLD.id_kegiatan,
        OLD.id_jadwal,
        JSON_OBJECT(
            'tanggal', OLD.tanggal,
            'waktu_mulai', OLD.waktu_mulai,
            'waktu_selesai', OLD.waktu_selesai,
            'created_at', OLD.created_at
        )
    );
END$$

DELIMITER ;