const express = require("express");
const router = express.Router();
const { getAgenda, createAgenda, updateAgenda, deleteAgenda } = require("../controllers/agendaController");
const { authenticate } = require('../middleware/auth');

// Tambahkan authenticate middleware ke semua routes yang membutuhkan auth
router.get("/", authenticate, getAgenda);
router.post("/", authenticate, createAgenda);
router.put("/:id", authenticate, updateAgenda);
router.delete("/:id", authenticate, deleteAgenda);

module.exports = router;