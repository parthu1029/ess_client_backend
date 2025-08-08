const express = require('express');
const router = express.Router();
const flightTicketController = require('../controllers/flightTicket.controller');

// Get flight ticket request details for an employee
router.get('/getFlightTicketRequestDetails', flightTicketController.getFlightTicketRequestDetails);
// Get flight ticket transactions/history
router.get('/getFlightTicketTransactions', flightTicketController.getFlightTicketTransactions);
// Submit a new flight ticket request
router.post('/submitFlightTicketRequest', flightTicketController.submitFlightTicketRequest);
// Submit flight ticket request on behalf of another employee
router.post('/submitFlightTicketRequestOnBehalf', flightTicketController.submitFlightTicketRequestOnBehalf);
// Edit (patch) existing flight ticket request
router.patch('/editFlightTicketRequest', flightTicketController.editFlightTicketRequest);
// Draft save flight ticket request
router.post('/draftSaveFlightTicketRequest', flightTicketController.draftSaveFlightTicketRequest);
// Delegate flight ticket approval to another approver
router.post('/delegateFlightTicketApproval', flightTicketController.delegateFlightTicketApproval);
// Change flight ticket request approval status
router.patch('/changeFlightTicketApproval', flightTicketController.changeFlightTicketApproval);
// Approve or reject flight ticket request
router.patch('/approveRejectFlightTicketRequest', flightTicketController.approveRejectFlightTicketRequest);
// Get details for a pending flight ticket request
router.get('/getPendingFlightTicketRequestsDetails', flightTicketController.getPendingFlightTicketRequestsDetails);
// Get all pending flight ticket requests for approver
router.get('/getPendingFlightTicketRequests', flightTicketController.getPendingFlightTicketRequests);

module.exports = router;