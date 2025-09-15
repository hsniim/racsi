const express = require("express");
const router = express.Router();
const gedungController = require("../controllers/gedungController");
const { authenticate } = require('../middleware/auth');

router.get("/", gedungController.getGedungs);
router.post("/", gedungController.addGedung);
router.put("/:id", gedungController.updateGedung);
router.delete("/:id", gedungController.deleteGedung);

module.exports = router;
