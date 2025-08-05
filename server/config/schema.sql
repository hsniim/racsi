CREATE DATABASE IF NOT EXISTS racsites;

USE racsites;

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status ENUM('kosong', 'terpakai') DEFAULT 'kosong'
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  event VARCHAR(100),
  start_time DATETIME,
  end_time DATETIME,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);