const express = require('express');
const router = express.Router();
const businessTripController = require('../controllers/bussinessTrip.controller');

router.get('/getBusinessTripRequestDetails',businessTripController.getBusinessTripRequestDetails)
router.get('/getBusinessTripTransactions',businessTripController.getBusinessTripTransactions)
router.post('/submitBusinessTripRequest',businessTripController.submitBusinessTripRequest)
router.post('/submitBusinessTripRequestOnBehalf',businessTripController.submitBusinessTripRequestOnBehalf)
router.patch('/editBusinessTripRequest',businessTripController.editBusinessTripRequest)
router.post('/draftSaveBusinessTripRequest',businessTripController.draftSaveBusinessTripRequest)
router.post('/delegateBusinessTripApproval',businessTripController.delegateBusinessTripApproval)
router.patch('/changeBusinessTripApproval',businessTripController.changeBusinessTripApproval)
router.patch('/approveRejectBusinessTripRequest',businessTripController.approveRejectBusinessTripRequest)
router.get('/getPendingBusinessTripRequests',businessTripController.getPendingBusinessTripRequests)
router.get('/getPendingBusinessTripRequestDetails',businessTripController.getPendingBusinessTripRequestDetails)

module.exports = router;
