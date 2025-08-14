const express = require('express');
const router = express.Router();
const { addKegiatan } = require('../controllers/kegiatanController');
const { authenticate } = require('../middleware/auth');

router.post('/kegiatan', authenticate, addKegiatan);

module.exports = router;