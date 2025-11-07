const express = require("express");
const router = express.Router();
const {
  addPjGedung,
  getAllPjGedung,
  getPjGedungByGedung,  // IMPORT FUNGSI BARU
  updatePjGedung,
  deletePjGedung,
} = require("../controllers/pjGedungController");

router.post("/", addPjGedung);
router.get("/", getAllPjGedung);
router.get("/gedung/:id_gedung", getPjGedungByGedung);  // ROUTE BARU untuk filter by gedung
router.put("/:id", updatePjGedung);
router.delete("/:id", deletePjGedung);

module.exports = router;