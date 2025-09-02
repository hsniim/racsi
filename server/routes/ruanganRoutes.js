const express = require('express');
const router = express.Router();
const { 
  addRuangan, 
  getRuangans, 
  getRuanganWithJadwal, 
  getRuanganWithJadwalTv,
  updateRuangan, 
  deleteRuangan 
} = require('../controllers/ruanganController');
const { authenticate } = require('../middleware/auth');

// Tambah ruangan (butuh token)
router.post('/ruangan', authenticate, addRuangan);

// Ambil semua ruangan (butuh token)
router.get('/ruangan', authenticate, getRuangans);

// Ambil ruangan + jadwal (ADMIN, butuh token)
router.get('/ruangan/with-jadwal', authenticate, getRuanganWithJadwal);

// Ambil ruangan + jadwal (PUBLIC, tanpa token) -> untuk Home / publik
router.get('/ruangan/public/with-jadwal', getRuanganWithJadwal);

// Untuk TV Device → route public khusus TV (tidak pakai authenticate)
router.get('/ruangan/tv/with-jadwal', getRuanganWithJadwalTv);

// Update ruangan (butuh token)
router.put('/ruangan/:id', authenticate, updateRuangan);

// Delete ruangan (butuh token)
router.delete('/ruangan/:id', authenticate, deleteRuangan);

module.exports = router;
