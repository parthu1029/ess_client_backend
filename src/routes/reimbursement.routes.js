const express = require('express');
const router = express.Router();
const reimbursementController = require('../controllers/reimbursementController');
const upload = require('../middleware/upload');

router.post('/submit', upload.single('receipt'), reimbursementController.submitReimbursement);
router.get('/history/:empId', reimbursementController.getReimbursementHistory);
router.get('/status/:empId', reimbursementController.getReimbursementStatus);
router.put('/approve/:reimbursementId', reimbursementController.approveRejectReimbursement);
router.get('/types', reimbursementController.getReimbursementTypes);
router.get('/pending/:managerId', reimbursementController.getPendingReimbursements);
router.delete('/cancel/:reimbursementId', reimbursementController.cancelReimbursement);

module.exports = router;
