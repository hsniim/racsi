const express = require('express');
const router = express.Router();
const { addJadwal, getJadwals, updateJadwal, deleteJadwal } = require('../controllers/jadwalController');
const { authenticate } = require('../middleware/auth');

router.post('/jadwal', authenticate, addJadwal); // Tambah jadwal
router.get('/jadwal', authenticate, getJadwals);  // Ambil semua jadwal
router.put('/jadwal/:id', authenticate, updateJadwal);   // Edit jadwal
router.delete('/jadwal/:id', authenticate, deleteJadwal); // Hapus jadwal


module.exports = router;
