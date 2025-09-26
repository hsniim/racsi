const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  getDashboardStats, 
  getGedungLantaiList,
  backupMainDatabase,
  backupArchiveDatabase
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Endpoint login admin
router.post('/admin/login', loginAdmin);

// Endpoint dashboard (butuh token JWT)
router.get('/admin/dashboard', authenticate, getDashboardStats);

// Endpoint gedung-lantai list (butuh token JWT)
router.get('/admin/gedung-lantai-list', authenticate, getGedungLantaiList);

// Endpoint backup database utama
router.get('/admin/backup/main', authenticate, backupMainDatabase);

// Endpoint backup database arsip
router.get('/admin/backup/archive', authenticate, backupArchiveDatabase);

module.exports = router;