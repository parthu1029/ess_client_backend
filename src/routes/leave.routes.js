const express = require('express');
const leaveController = require('../controllers/leave.controller');
const upload = require('../middlewares/upload');
const router = express.Router();

router.post('/applyLeave', upload.single('attachment'), leaveController.applyLeave);
router.get('/getLeaveHistory', leaveController.getLeaveHistory);
router.get('/getLeaveTypes', leaveController.getLeaveTypes);
router.delete('/cancelLeave', leaveController.cancelLeave);
router.put('/approveRejectLeave', leaveController.approveRejectLeave);
router.get('/getPendingLeaveRequests', leaveController.getPendingLeaves);
router.get('/getLeavesById', leaveController.getLeaveById);
router.put('/updatedLeave', leaveController.updateLeave);
router.get('/getLeaveRequestTransactions',leaveController.getLeaveRequestTransactions)
router.get('/getLeaveRequestDetails',leaveController.getLeaveRequestDetails)
router.post('/submitLeaveRequest', upload.single('attachment'), leaveController.submitLeaveRequest)
router.post('/submitLeaveRequestOnBehalf', upload.single('attachment'), leaveController.submitLeaveRequestOnBehalf)
router.patch('/editLeaveRequest',leaveController.editLeaveRequest)
router.post('/draftSaveLeaveRequest', upload.single('attachment'), leaveController.draftSaveLeaveRequest)
router.get('/getPendingLeaveRequestDetails',leaveController.getPendingLeaveRequestDetails)
router.patch('/approveRejectLeaveRequest',leaveController.approveRejectLeaveRequest)
router.patch('/changeLeaveRequestApproval',leaveController.changeLeaveRequestApproval)
router.post('/delegateLeaveRequest',leaveController.delegateLeaveApproval)

module.exports = router;
