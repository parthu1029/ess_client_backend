const attendanceService = require('../services/attendance.service');

// Mark today's attendance
exports.markAttendance = async (req, res) => {
  try {
    const { EmpID } = req.body; // or req.user.EmpID if you're using authentication
    const data = req.body; // includes date, status, time, etc.
    await attendanceService.markAttendance(EmpID, data);
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get today's attendance status
exports.getDailyStatus = async (req, res) => {
  try {
    const { EmpID, date } = req.query;
    const status = await attendanceService.getDailyStatus(EmpID, date);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get full attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const history = await attendanceService.getAttendanceHistory(EmpID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get monthly summary
exports.getMonthlySummary = async (req, res) => {
  try {
    const { EmpID, month, year } = req.query;
    const summary = await attendanceService.getMonthlySummary(EmpID, month, year);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { EmpID } = req.body; // or req.user.EmpID
    const data = req.body;
    await attendanceService.updateAttendance(EmpID, data);
    res.json({ message: 'Attendance updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get today's check-in/check-out time
exports.getCheckinCheckoutTime = async (req, res) => {
  try {
    const { EmpID, date } = req.query;
    const times = await attendanceService.getCheckinCheckoutTime(EmpID, date);
    res.json(times);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get check-in/check-out time history
exports.getCheckinCheckoutHistory = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const history = await attendanceService.getCheckinCheckoutHistory(EmpID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
