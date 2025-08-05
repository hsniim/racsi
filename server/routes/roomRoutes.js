const express = require('express');
const router = express.Router();
const { getAllRooms } = require('../controllers/roomControllers');

router.get('/rooms', getAllRooms);

module.exports = router;