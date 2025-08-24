const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.post('/markAttendance', attendanceController.markAttendance);
router.get('/getCheckinCheckoutHistory',attendanceController.getCheckinCheckoutHistory)
router.get('/getCheckinCheckoutTime', attendanceController.getCheckinCheckoutTime)

module.exports = router;
