const express = require('express');
const router = express.Router();
const {  getAllJadwal } = require('../controllers/jadwalController');

router.get('/jadwal', getAllJadwal);

module.exports = router;