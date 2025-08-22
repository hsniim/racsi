const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboardStats } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Endpoint login admin
router.post('/admin/login', loginAdmin);

// Endpoint dashboard (butuh token JWT)
router.get('/admin/dashboard', authenticate, getDashboardStats);

module.exports = router;
