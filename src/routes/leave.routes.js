const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.post('/apply', leaveController.applyLeave);
router.get('/status/:empId', leaveController.getLeaveStatus);
router.delete('/cancel/:leaveId', leaveController.cancelLeave);
router.get('/balance/:empId', leaveController.getLeaveBalance);
router.put('/approve/:leaveId', leaveController.approveRejectLeave);
router.get('/types', leaveController.getLeaveTypes);

module.exports = router;
