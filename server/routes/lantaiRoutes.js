const express = require('express');
const router = express.Router();
const { addLantai, getLantai, updateLantai, deleteLantai } = require('../controllers/lantaiController');
const { authenticate } = require('../middleware/auth');

router.post('/lantai', authenticate, addLantai);
router.get('/lantai', authenticate, getLantai);
router.put('/lantai/:id', authenticate, updateLantai);
router.delete('/lantai/:id', authenticate, deleteLantai);

module.exports = router;
