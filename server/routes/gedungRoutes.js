const express = require("express");
const router = express.Router();
const gedungController = require("../controllers/gedungController");
const { authenticate } = require('../middleware/auth');

// Route untuk QR feedback harus SEBELUM route :id agar tidak bentrok
router.get("/:id/qr-feedback", gedungController.getGedungFeedbackQR);
router.post("/:id/generate-qr-feedback", gedungController.upload, gedungController.generateGedungFeedbackQR);

// CRUD routes utama dengan upload middleware yang mendukung multiple files
router.get("/", gedungController.getGedungs);
router.post("/", gedungController.upload, gedungController.addGedung);
router.put("/:id", gedungController.upload, gedungController.updateGedung);
router.delete("/:id", gedungController.deleteGedung);

module.exports = router;