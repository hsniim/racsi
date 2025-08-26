const express = require('express');
const router = express.Router();
const { getHeaderData, getHeaderDataByIds } = require('../controllers/headerController');

// Endpoint untuk ambil data header default (gedung dan lantai pertama)
router.get('/header', getHeaderData);

// Endpoint untuk ambil data header berdasarkan ID spesifik
router.get('/header/:id_gedung/:id_lantai', getHeaderDataByIds);

module.exports = router;