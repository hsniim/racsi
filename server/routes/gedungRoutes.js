const express = require('express');
const router = express.Router();
const gedungController = require('../controllers/gedungController');
const { authenticate } = require('../middleware/auth');

// Semua route membutuhkan authenticate
router.get('/', authenticate, gedungController.getAllGedung);
router.post('/', authenticate, gedungController.createGedung);
router.put('/:id', authenticate, gedungController.updateGedung);
router.delete('/:id', authenticate, gedungController.deleteGedung);

module.exports = router;