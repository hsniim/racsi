const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

router.post('/admin/login', loginAdmin);

module.exports = router;