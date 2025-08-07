const express = require('express');
const router = express.Router();
const {  getAllGedung } = require('../controllers/gedungController');

router.get('/gedung', getAllGedung);

module.exports = router;