const express = require('express');
const router = express.Router();
const { addLantai } = require('../controllers/lantaiController');
const { authenticate } = require('../middleware/auth');

router.post('/lantai', authenticate, addLantai);

module.exports = router;