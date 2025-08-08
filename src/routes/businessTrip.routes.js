const express = require('express');
const router = express.Router();
const businessTripController = require('../controllers/businessTrip.controller');
const upload = require('../middlewares/upload');

router.get('/getBusinessTripRequestDetails',businessTripController.getBusinessTripRequestDetails)
router.get('/getBusinessTripTransactions',businessTripController.getBusinessTripTransactions)
router.post('/submitBusinessTripRequest', upload.single('attachment'), businessTripController.submitBusinessTripRequest)
router.post('/submitBusinessTripRequestOnBehalf', upload.single('attachment'), businessTripController.submitBusinessTripRequestOnBehalf)
router.patch('/editBusinessTripRequest',businessTripController.editBusinessTripRequest)
router.post('/draftSaveBusinessTripRequest', upload.single('attachment'), businessTripController.draftSaveBusinessTripRequest)
router.post('/delegateBusinessTripRequest',businessTripController.delegateBusinessTripRequest)
router.patch('/changeBusinessTripApproval',businessTripController.changeBusinessTripApproval)
router.patch('/approveRejectBusinessTripRequest',businessTripController.approveRejectBusinessTripRequest)
router.get('/getPendingBusinessTripRequests',businessTripController.getPendingBusinessTripRequests)
router.get('/getPendingBusinessTripRequestDetails',businessTripController.getPendingBusinessTripRequestDetails)

module.exports = router;
