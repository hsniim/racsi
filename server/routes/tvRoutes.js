const express = require('express');
const router = express.Router();
const { getDataTV } = require('../controllers/tvController');

router.get('/data_tv', getDataTV);

module.exports = router;