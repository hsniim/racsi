const express = require("express");
const router = express.Router();
const {
  getPJLantai,
  addPJLantai,
  updatePJLantai,
  deletePJLantai,
} = require("../controllers/pjLantaiController");

router.get("/", getPJLantai);
router.post("/", addPJLantai);
router.put("/:id", updatePJLantai);
router.delete("/:id", deletePJLantai);

module.exports = router;
