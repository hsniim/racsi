const express = require("express");
const router = express.Router();
const { getAgenda, createAgenda, updateAgenda, deleteAgenda } = require("../controllers/agendaController");
const { authenticate } = require('../middleware/auth');

router.get("/", getAgenda);
router.post("/", createAgenda);
router.put("/:id", updateAgenda);
router.delete("/:id", deleteAgenda);

module.exports = router;
