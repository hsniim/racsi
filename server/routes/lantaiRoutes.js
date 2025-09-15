const express = require("express");
const router = express.Router();
const lantaiController = require("../controllers/lantaiController");
const { authenticate } = require("../middleware/auth");

router.get("/", lantaiController.getLantais);
router.post("/", lantaiController.addLantai);
router.put("/:id", lantaiController.updateLantai);
router.delete("/:id", lantaiController.deleteLantai);

module.exports = router;
