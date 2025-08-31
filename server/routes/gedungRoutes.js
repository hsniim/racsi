const express = require('express');
const router = express.Router();
const { addGedung, getAllGedung, updateGedung, deleteGedung } = require('../controllers/gedungController');
const { authenticate } = require('../middleware/auth');

// Tambah gedung
router.post('/gedung', authenticate, addGedung);

// 🔹 Ambil semua gedung
router.get('/gedung', authenticate, getAllGedung);

// Update gedung
router.put('/gedung/:id', authenticate, updateGedung);

// Delete gedung
router.delete('/gedung/:id', authenticate, deleteGedung);

module.exports = router;
