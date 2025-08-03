const express = require('express');
const performanceController = require('../controllers/performance.controller');
const router = express.Router();

router.post('/submitSelfEvaluation', performanceController.submitSelfEvaluation);
router.get('/getFeedback', performanceController.getFeedback);
router.post('/submitManagerFeedback', performanceController.submitManagerFeedback);
router.get('/getPerformanceReviews', performanceController.getPerformanceReviews);
router.post('/createPerformanceGoal', performanceController.createPerformanceGoal);
router.put('/updatePerformanceGoal', performanceController.updatePerformanceGoal);
router.get('/getPerformanceGoals', performanceController.getPerformanceGoals);
router.get('/getPerformanceMetrics', performanceController.getPerformanceMetrics);
router.get('/getPeerFeedback', performanceController.getPeerFeedback);
router.post('/submitPeerFeedback', performanceController.submitPeerFeedback);
router.post('/generatePerformanceReport', performanceController.generatePerformanceReport);

module.exports = router;
