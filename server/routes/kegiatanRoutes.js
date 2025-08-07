const express = require('express');
const router = express.Router();
const {  getAllKegiatan } = require('../controllers/kegiatanController');

router.get('/kegiatan', getAllKegiatan);

module.exports = router;