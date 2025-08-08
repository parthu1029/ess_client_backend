const express = require('express');
const leaveController = require('../controllers/leave.controller');
const router = express.Router();

router.post('/applyLeave', leaveController.applyLeave);
router.get('/getLeaveBalance', leaveController.getLeaveBalance);
router.get('/getLeaveHistory', leaveController.getLeaveHistory);
router.get('/getLeaveTypes', leaveController.getLeaveTypes);
router.get('/getLeaveStatus', leaveController.getLeaveStatus);
router.delete('/cancelLeave', leaveController.cancelLeave);
router.put('/approveRejectLeave', leaveController.approveRejectLeave);
router.get('/getPendingLeaves', leaveController.getPendingLeaves);
router.get('/getLeavesById', leaveController.getLeaveById);
router.put('/updatedLeave', leaveController.updateLeave);
router.get('/getLeaveRequestTransactions',leaveController.getLeaveRequestTransactions)
router.get('/getLeaveRequestDetails',leaveController.getLeaveRequestDetails)
router.post('/submitLeave',leaveController.submitLeave)
router.post('/submitLeaveOnBehalf',leaveController.submitLeaveOnBehalf)
router.get('/getPendingLeaves',leaveController.getPendingLeaves)
router.patch('/editLeaveRequest',leaveController.editLeaveRequest)
router.post('/draftSaveLeaveRequest',leaveController.draftSaveLeaveRequest)
router.get('/getPendingLeaveRequestDetails',leaveController.getPendingLeaveRequestDetails)
router.patch('/approveRejectLeaveRequest',leaveController.approveRejectLeaveRequest)
router.patch('/changeLeaveRequestApproval',leaveController.changeLeaveRequestApproval)
router.get('/getDelegates',leaveController.getDelegates)
router.post('/delegateLeaveApproval',leaveController.delegateLeaveApproval)

module.exports = router;
