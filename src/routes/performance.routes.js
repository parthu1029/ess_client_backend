const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.post('/self-eval/:empId', performanceController.submitSelfEvaluation);
router.get('/feedback/:empId', performanceController.getFeedback);
router.post('/manager-feedback/:empId', performanceController.submitManagerFeedback);

module.exports = router;
