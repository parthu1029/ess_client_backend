const teamService = require('../services/team.service');

exports.getTeamHierarchy = async (req, res) => {
  try {
    // Accept ManagerEmpID via query or from logged-in user
    const managerEmpID = req.cookies.empid;
    if (!managerEmpID) {
      return res.status(400).json({ error: 'ManagerEmpID required.' });
    }
    const hierarchy = await teamService.getTeamHierarchy(managerEmpID, req.cookies.context.companyid);
    res.json(hierarchy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamCalendar = async (req, res) => {
  try {
    const managerEmpID = req.cookies.empid;
    if (!managerEmpID) {
      return res.status(400).json({ error: 'ManagerEmpID required.' });
    }
    const calendar = await teamService.getTeamCalendar(managerEmpID, req.cookies.context.companyid);
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
