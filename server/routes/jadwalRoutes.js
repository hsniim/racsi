const express = require('express');
const router = express.Router();
const { addJadwal } = require('../controllers/jadwalController');
const { authenticate } = require('../middleware/auth');

router.post('/jadwal', authenticate, addJadwal);

module.exports = router;