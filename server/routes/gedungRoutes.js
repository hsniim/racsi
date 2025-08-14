const express = require('express');
const router = express.Router();
const { addGedung } = require('../controllers/gedungController');
const { authenticate } = require('../middleware/auth'); // Impor middleware

// Terapkan middleware sebelum handler
router.post('/gedung', authenticate, addGedung);

module.exports = router;