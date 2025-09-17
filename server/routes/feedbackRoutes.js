// server/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Public routes (untuk pengguna umum)
router.post('/', feedbackController.createFeedback);
router.get('/summary', feedbackController.getFeedbackSummary);

// Admin routes (mungkin perlu middleware auth jika ada)
router.get('/stats', feedbackController.getFeedbackStats);
router.get('/ruangan/:id_ruangan', feedbackController.getFeedbackByRuangan);

module.exports = router;