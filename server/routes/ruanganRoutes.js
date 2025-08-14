const express = require('express');
const router = express.Router();
const { addRuangan } = require('../controllers/ruanganController');
const { authenticate } = require('../middleware/auth');

router.post('/ruangan', authenticate, addRuangan);

module.exports = router;