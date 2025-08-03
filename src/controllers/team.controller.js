const teamService = require('../services/team.service');

exports.getTeamHierarchy = async (req, res) => {
  try {
    // Accept ManagerEmpID via query or from logged-in user
    const managerEmpID = req.query.ManagerEmpID || req.user?.EmpID;
    if (!managerEmpID) {
      return res.status(400).json({ error: 'ManagerEmpID required.' });
    }
    const hierarchy = await teamService.getTeamHierarchy(managerEmpID);
    res.json(hierarchy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamCalendar = async (req, res) => {
  try {
    const managerEmpID = req.query.ManagerEmpID || req.user?.EmpID;
    if (!managerEmpID) {
      return res.status(400).json({ error: 'ManagerEmpID required.' });
    }
    const calendar = await teamService.getTeamCalendar(managerEmpID);
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
