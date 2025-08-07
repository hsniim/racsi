const express = require('express');
const router = express.Router();
const {  getAllLantai } = require('../controllers/lantaiController');

router.get('/lantai', getAllLantai);

module.exports = router;