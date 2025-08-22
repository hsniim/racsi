const express = require('express');
const router = express.Router();
const { addLantai, getLantai } = require('../controllers/lantaiController');
const { authenticate } = require('../middleware/auth');

router.post('/lantai', authenticate, addLantai);
router.get('/lantai', authenticate, getLantai); // endpoint untuk fetch data lantai

module.exports = router;
