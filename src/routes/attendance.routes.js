const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/mark', attendanceController.markAttendance);
router.get('/status/:empId', attendanceController.getDailyStatus);
router.get('/history/:empId', attendanceController.getAttendanceHistory);
router.get('/summary/:empId', attendanceController.getMonthlySummary);
router.put('/update/:empId', attendanceController.updateAttendance); // Admin only

module.exports = router;
