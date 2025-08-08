const express = require('express');
const requestController = require('../controllers/request.controller');
const router = express.Router();
router.get('/getRequestTransactions', requestController.getRequestTransactions);
router.get('/getRequestTimeline', requestController.getRequestTimeline);
module.exports = router;
