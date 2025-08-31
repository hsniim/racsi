const express = require('express');
const router = express.Router();
const { addRuangan, getRuangans, getRuanganWithJadwal, updateRuangan, deleteRuangan } = require('../controllers/ruanganController');
const { authenticate } = require('../middleware/auth');

// Tambah ruangan (butuh token)
router.post('/ruangan', authenticate, addRuangan);

// Ambil semua ruangan (butuh token)
router.get('/ruangan', authenticate, getRuangans);

// Ambil semua ruangan + jadwal hari ini (opsional, bisa dipanggil frontend terpisah)
router.get('/ruangan/with-jadwal', authenticate, getRuanganWithJadwal);

// Update ruangan
router.put('/lantai/:id', authenticate, updateRuangan);

// Delte ruangan
router.delete('/ruangan/:id', authenticate, deleteRuangan);

module.exports = router;
