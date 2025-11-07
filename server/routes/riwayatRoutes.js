const express = require('express');
const router = express.Router();
const { getRiwayat, addRiwayat, } = require('../controllers/riwayatController');
const { authenticate } = require('../middleware/auth');

// Ambil semua riwayat
router.get('/riwayat', getRiwayat);

// Tambah kegiatan baru
router.post('/riwayat', addRiwayat);

module.exports = router;
