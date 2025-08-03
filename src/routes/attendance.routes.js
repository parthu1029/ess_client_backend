const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.post('/markAttendance', attendanceController.markAttendance);
router.get('/getDailyStatus', attendanceController.getDailyStatus);
router.get('/getAttendanceHistory', attendanceController.getAttendanceHistory);
router.get('/getMonthlySummary', attendanceController.getMonthlySummary);
router.put('/updateAttendance', attendanceController.updateAttendance); 
router.get('/getCheckinCheckoutTime',attendanceController.getCheckinCheckoutTime)
router.get('/getCheckinCheckoutHistory',attendanceController.getCheckinCheckoutHistory)

module.exports = router;
