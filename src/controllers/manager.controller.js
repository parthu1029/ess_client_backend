const managerService = require('../services/manager.service');

exports.bulkApproveReject = async (req, res) => {
  try {
    const result = await managerService.bulkApproveReject(req.body, req.cookies.empid, req.cookies.context.companyid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamAttendanceSummary = async (req, res) => {
  try {
    const month = req.headers['month'];
    const year = req.headers['year'];
    const ManagerEmpID = req.cookies.empid;
    const summary = await managerService.getTeamAttendanceSummary(ManagerEmpID, parseInt(month), parseInt(year));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


