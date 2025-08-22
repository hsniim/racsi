const express = require('express');
const router = express.Router();
const { addGedung, getAllGedung } = require('../controllers/gedungController');
const { authenticate } = require('../middleware/auth');

// Tambah gedung
router.post('/gedung', authenticate, addGedung);

// 🔹 Ambil semua gedung
router.get('/gedung', authenticate, getAllGedung);

module.exports = router;
