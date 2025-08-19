const express = require('express');
const router = express.Router();
const { addRuangan, getRuanganWithJadwal } = require('../controllers/ruanganController');
const { authenticate } = require('../middleware/auth');

router.post('/ruangan', authenticate, addRuangan);
router.get("/with-jadwal", getRuanganWithJadwal);

module.exports = router;