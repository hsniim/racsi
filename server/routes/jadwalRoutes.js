const express = require('express');
const router = express.Router();
const { addJadwal, getJadwals } = require('../controllers/jadwalController');
const { authenticate } = require('../middleware/auth');

router.post('/jadwal', authenticate, addJadwal); // Tambah jadwal
router.get('/jadwal', authenticate, getJadwals);  // Ambil semua jadwal

module.exports = router;
