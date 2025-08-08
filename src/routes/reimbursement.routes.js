const express = require('express');
const multer = require('multer');
const reimbursementController = require('../controllers/reimbursement.controller');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Reimbursement endpoints (current version)

// Get all reimbursement transactions
router.get('/getReimbursementTransactions', reimbursementController.getReimbursementTransactions);

// Get details of a specific reimbursement request
router.get('/getReimbursementRequestDetails', reimbursementController.getReimbursementRequestDetails);

// Submit a new reimbursement request
router.post('/submitReimbursementRequest', upload.single('receipt'), reimbursementController.submitReimbursementRequest);

// Submit a reimbursement request on behalf of another employee
router.post('/submitReimbursementRequestOnBehalf', upload.single('receipt'), reimbursementController.submitReimbursementRequestOnBehalf);

// Edit an existing reimbursement request
router.patch('/editReimbursementRequest', reimbursementController.editReimbursementRequest);

// Save a reimbursement request as draft
router.post('/draftSaveReimbursementRequest', reimbursementController.draftSaveReimbursementRequest);

// Delegate reimbursement approval
router.post('/delegateReimbursementRequest', reimbursementController.delegateReimbursementApproval);

// Change approval status (patch)
router.patch('/changeReimbursementApproval', reimbursementController.changeReimbursementApproval);

// Approve or reject a reimbursement request
router.patch('/approveRejectReimbursementRequest', reimbursementController.approveRejectReimbursementRequest);

// Get pending reimbursement requests for approver
router.get('/getPendingReimbursementRequests', reimbursementController.getPendingReimbursementRequests);

// Get details of a pending reimbursement request
router.get('/getPendingReimbursementRequestDetails', reimbursementController.getPendingReimbursementRequestDetails);

module.exports = router;
