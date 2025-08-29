const express = require("express");
const router = express.Router();
const {
  addPjGedung,
  getAllPjGedung,
  updatePjGedung,
  deletePjGedung,
} = require("../controllers/pjGedungController");

router.post("/", addPjGedung);
router.get("/", getAllPjGedung);
router.put("/:id", updatePjGedung);
router.delete("/:id", deletePjGedung);

module.exports = router;
