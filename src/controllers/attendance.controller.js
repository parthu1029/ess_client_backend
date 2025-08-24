const attendanceService = require('../services/attendance.service');

// Mark today's attendance
exports.markAttendance = async (req, res) => {
  try {
    const { empid: EmpID, companyid: CompanyID } = req.body;
    const data = req.body;
    await attendanceService.markAttendance(EmpID, CompanyID, data);
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get check-in/check-out time history
exports.getCheckinCheckoutHistory = async (req, res) => {
  try {
    const history = await attendanceService.getCheckinCheckoutHistory(req.cookies.empid, req.cookies.context.companyid);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get most recent check-in/check-out time for the employee
exports.getCheckinCheckoutTime = async (req, res) => {
  try {
    const latest = await attendanceService.getCheckinCheckoutTime(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(latest || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
