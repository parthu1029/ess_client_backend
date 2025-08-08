const express = require('express');
const managerController = require('../controllers/manager.controller');
const router = express.Router();

router.post('/bulk-approve-reject', managerController.bulkApproveReject);
router.get('/getTeamAttendanceSummary', managerController.getTeamAttendanceSummary);

module.exports = router;
