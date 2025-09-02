const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/tvDeviceController');

/* admin (CRUD) */
router.get('/tv-device', authenticate, ctrl.getDevices);
router.post('/tv-device', authenticate, ctrl.createDevice);
router.put('/tv-device/:id', authenticate, ctrl.updateDevice);
router.delete('/tv-device/:id', authenticate, ctrl.deleteDevice);

/* publik untuk TV (tanpa auth, hanya read) */
router.get('/tv-device/:id/config', ctrl.getConfigByDevice);
router.get('/tv-device/:id/data', ctrl.getDataForDevice);

module.exports = router;
