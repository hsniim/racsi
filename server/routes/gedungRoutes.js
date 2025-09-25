const express = require("express");
const router = express.Router();
const gedungController = require("../controllers/gedungController");
const { authenticate } = require('../middleware/auth');

// Route untuk QR feedback harus SEBELUM route :id agar tidak bentrok
router.get("/:id/qr-feedback", gedungController.getGedungFeedbackQR);
router.post("/:id/generate-qr-feedback", gedungController.generateGedungFeedbackQR);

// CRUD routes utama
router.get("/", gedungController.getGedungs);
router.post("/", gedungController.addGedung);
router.put("/:id", gedungController.updateGedung);
router.delete("/:id", gedungController.deleteGedung);

module.exports = router;