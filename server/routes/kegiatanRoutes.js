const express = require('express');
const router = express.Router();
const { addKegiatan, getKegiatans } = require('../controllers/kegiatanController');
const { authenticate } = require('../middleware/auth');

// Tambah kegiatan
router.post('/kegiatan', authenticate, addKegiatan);

// Ambil semua kegiatan
router.get('/kegiatan', authenticate, getKegiatans);

module.exports = router;
