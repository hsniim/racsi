const express = require('express');
const router = express.Router();
const { addKegiatan, getKegiatans, updateKegiatan, deleteKegiatan } = require('../controllers/kegiatanController');
const { authenticate } = require('../middleware/auth');

// Tambah kegiatan
router.post('/kegiatan', authenticate, addKegiatan);

// Ambil semua kegiatan
router.get('/kegiatan', authenticate, getKegiatans);

// Update kegiatan
router.put('/kegiatan/:id', authenticate, updateKegiatan);

// Hapus kegiatan
router.delete('/kegiatan/:id', authenticate, deleteKegiatan);

module.exports = router;
