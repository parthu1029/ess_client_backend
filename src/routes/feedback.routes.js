const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const router = express.Router();

router.post('/submitFeedback', feedbackController.submitFeedback);
router.get('/getFeedbackHistory', feedbackController.getFeedbackHistory);
router.get('/getReceivedFeedback', feedbackController.getReceivedFeedback);
router.get('/getFeedbackById', feedbackController.getFeedbackById);
router.put('/updateFeedback', feedbackController.updateFeedback);
router.delete('/deleteFeedback', feedbackController.deleteFeedback);
router.get('/getFeedbackTypes', feedbackController.getFeedbackTypes);
router.get('/getFeedbackAnalytics', feedbackController.getFeedbackAnalytics);
router.post('/respondToFeedbackById', feedbackController.respondToFeedback);
router.put('/markFeedbackAsRead', feedbackController.markFeedbackAsRead);
router.get('/getTeamFeedback', feedbackController.getTeamFeedback);
router.post('/generateFeedbackReport', feedbackController.generateFeedbackReport);

module.exports = router;