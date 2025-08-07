const express = require('express');
const router = express.Router();
const {  getAllRuangan } = require('../controllers/roomControllers');

router.get('/ruangan', getAllRuangan);

module.exports = router;