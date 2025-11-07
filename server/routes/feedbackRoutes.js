const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

// PENTING: Route summary harus SEBELUM route :id agar tidak bentrok
router.get("/summary", feedbackController.getFeedbackSummary);
router.get("/stats", feedbackController.getFeedbackStats);

// CRUD Feedback (tanpa QR code routes)
router.get("/", feedbackController.getAllFeedback);
router.get("/:id", feedbackController.getFeedbackById);
router.post("/", feedbackController.createFeedback);
router.put("/:id", feedbackController.updateFeedback);
router.delete("/:id", feedbackController.deleteFeedback);

// Additional routes
router.get("/ruangan/:id_ruangan", feedbackController.getFeedbackByRuangan);

module.exports = router;