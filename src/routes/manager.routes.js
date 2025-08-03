const express = require('express');
const managerController = require('../controllers/manager.controller');
const router = express.Router();

router.get('/getTeam', managerController.getTeam);
router.post('/bulk-approve', managerController.bulkApprove);
router.get('/getPendingApprovals', managerController.getPendingApprovals);
router.get('/getTeamMemberDetails', managerController.getTeamMemberDetails);
router.get('/getManagerDashboard', managerController.getManagerDashboard);
router.get('/getTeamAttendanceSummary', managerController.getTeamAttendanceSummary);
router.get('/searchTeamMembers', managerController.searchTeamMembers);
router.post('/assignTask', managerController.assignTask);
router.put('/updateTeamMember', managerController.updateTeamMember);
router.get('/getTeamPerformance', managerController.getTeamPerformance);

module.exports = router;
