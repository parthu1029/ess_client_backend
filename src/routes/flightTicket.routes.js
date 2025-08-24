const express = require('express');
const router = express.Router();
const flightTicketController = require('../controllers/flightTicket.controller');

router.get('/getFlightTicketRequestDetails', flightTicketController.getFlightTicketRequestDetails);
router.get('/getFlightTicketTransactions', flightTicketController.getFlightTicketTransactions);
router.post('/submitFlightTicketRequest', flightTicketController.submitFlightTicketRequest);
router.post('/submitFlightTicketRequestOnBehalf', flightTicketController.submitFlightTicketRequestOnBehalf);
router.patch('/editFlightTicketRequest', flightTicketController.editFlightTicketRequest);
router.post('/draftSaveFlightTicketRequest', flightTicketController.draftSaveFlightTicketRequest);
router.post('/delegateFlightTicketRequest', flightTicketController.delegateFlightTicketApproval);
router.patch('/changeFlightTicketApproval', flightTicketController.changeFlightTicketApproval);
router.patch('/approveRejectFlightTicketRequest', flightTicketController.approveRejectFlightTicketRequest);
router.get('/getPendingFlightTicketRequestDetails', flightTicketController.getPendingFlightTicketRequestDetails);
router.get('/getPendingFlightTicketRequests', flightTicketController.getPendingFlightTicketRequests);

module.exports = router;