const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth'); // Opsional, jika autentikasi dibutuhkan

router.post('/admin/login', loginAdmin); // Tanpa authenticate untuk login awal

module.exports = router;