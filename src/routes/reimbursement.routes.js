const express = require('express');
const multer = require('multer');
const reimbursementController = require('../controllers/reimbursement.controller');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/getReimbursementTransactions', reimbursementController.getReimbursementTransactions);
router.get('/getReimbursementRequestDetails', reimbursementController.getReimbursementRequestDetails);
router.post('/submitReimbursementRequest', upload.single('receipt'), reimbursementController.submitReimbursementRequest);
router.post('/submitReimbursementRequestOnBehalf', upload.single('receipt'), reimbursementController.submitReimbursementRequestOnBehalf);
router.patch('/editReimbursementRequest', reimbursementController.editReimbursementRequest);
router.post('/draftSaveReimbursementRequest', reimbursementController.draftSaveReimbursementRequest);
router.post('/delegateReimbursementRequest', reimbursementController.delegateReimbursementApproval);
router.patch('/changeReimbursementApproval', reimbursementController.changeReimbursementApproval);
router.patch('/approveRejectReimbursementRequest', reimbursementController.approveRejectReimbursementRequest);
router.get('/getPendingReimbursementRequests', reimbursementController.getPendingReimbursementRequests);
router.get('/getPendingReimbursementRequestDetails', reimbursementController.getPendingReimbursementRequestDetails);

module.exports = router;
