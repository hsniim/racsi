CREATE DATABASE IF NOT EXISTS db_racsi;
USE db_racsi;

-- Tabel gedung
CREATE TABLE gedung (
    id_gedung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_gedung VARCHAR(50) NOT NULL
);

-- Tabel lantai
CREATE TABLE lantai (
    id_lantai INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_gedung INT UNSIGNED NOT NULL,
    nomor_lantai TINYINT NOT NULL,
    FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabel ruangan
CREATE TABLE ruangan (
    id_ruangan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_lantai INT UNSIGNED NOT NULL,
    nama_ruangan VARCHAR(20) NOT NULL,
    kapasitas VARCHAR(20) NOT NULL,
    status ENUM('kosong', 'terpakai') DEFAULT 'kosong',
    FOREIGN KEY (id_lantai) REFERENCES lantai(id_lantai)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabel kegiatan
CREATE TABLE kegiatan (
    id_kegiatan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_ruangan INT UNSIGNED NOT NULL,
    nama_kegiatan VARCHAR(50) NOT NULL,
    deskripsi_kegiatan TEXT,
    penanggung_jawab VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabel jadwal
CREATE TABLE jadwal (
    id_jadwal INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_kegiatan INT UNSIGNED NOT NULL,
    id_ruangan INT UNSIGNED NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    FOREIGN KEY (id_kegiatan) REFERENCES kegiatan(id_kegiatan)
        ON DELETE CASCADE ON UPDATE CASCADE
);
