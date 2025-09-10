const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  getDashboardStats, 
  getGedungLantaiList  // Import controller baru
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Endpoint login admin
router.post('/admin/login', loginAdmin);

// Endpoint dashboard (butuh token JWT)
router.get('/admin/dashboard', authenticate, getDashboardStats);

// Endpoint gedung-lantai list (butuh token JWT)
router.get('/admin/gedung-lantai-list', authenticate, getGedungLantaiList);

module.exports = router;