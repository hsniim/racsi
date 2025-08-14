const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

router.post('/admin', loginAdmin);

module.exports = router;