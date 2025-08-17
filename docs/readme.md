# Room Information System
Racsi : Room and Control Schedule Interface

## Tech Stack
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Express.js, Socket.IO
- Database: MySQL

## Setup
### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

### Backend
1. `cd server`
2. `npm install`
3. Buat file `.env` (lihat `.env.example`)
4. `node server.js`

## Database
1. Install MySQL.
2. Buat database `db_racsi`.
3. Jalankan skema database di `/server/config/schema.sql`.

## Autentikasi
1. pastikan sudah ada tabel admin di database
2. npm install jsonwebtoken bcryptjs
3. node hashPassword.js
4. login mysql 
5. INSERT INTO admin (username, password) VALUES ('racmin', 'paste_hash_di_sini');
6. curl -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d '{"username":"racmin","password":"minrac21"}'

curl -X POST http://localhost:5000/api/gedung -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"nama_gedung":"Gedung A","lokasi_gedung":"jakarta","pj_gedung":"Admin A"}'

curl -X POST http://localhost:5000/api/lantai -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"id_gedung":1,"nomor_lantai":1,"pj_lantaipagi":"PJ Pagi","pj_lantaisiang":"PJ Siang"}'

curl -X POST http://localhost:5000/api/ruangan -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"id_lantai":1,"nama_ruangan":"Ruang 101","kapasitas":"50","status":"tidak_digunakan"}'

curl -X POST http://localhost:5000/api/kegiatan -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"id_ruangan":1,"nama_kegiatan":"Rapat","deskripsi_kegiatan":"Rapat mingguan","pengguna":"Budi"}'

curl -X POST http://localhost:5000/api/jadwal -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"id_kegiatan":1,"tanggal":"2025-08-14","waktu_mulai":"10:00:00","waktu_selesai":"11:00:00"}'