const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Public routes (untuk pengguna umum)
router.post('/', feedbackController.createFeedback);
router.get('/summary', feedbackController.getFeedbackSummary);

// Admin routes
router.get('/', feedbackController.getAllFeedback);
router.get('/stats', feedbackController.getFeedbackStats);
router.get('/ruangan/:id_ruangan', feedbackController.getFeedbackByRuangan);

// Update & Delete feedback
router.put('/:id_feedback', feedbackController.updateFeedback);
router.delete('/:id_feedback', feedbackController.deleteFeedback);

module.exports = router;