const managerService = require('../services/manager.service');

exports.getTeam = async (req, res) => {
  try {
    const team = await managerService.getTeam(req.query.ManagerEmpID);
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkApprove = async (req, res) => {
  try {
    const result = await managerService.bulkApprove(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const approvals = await managerService.getPendingApprovals(req.query.ManagerEmpID);
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamMemberDetails = async (req, res) => {
  try {
    const member = await managerService.getTeamMemberDetails(req.query.EmpID);
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getManagerDashboard = async (req, res) => {
  try {
    const dashboard = await managerService.getManagerDashboard(req.query.ManagerEmpID);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamAttendanceSummary = async (req, res) => {
  try {
    const { ManagerEmpID, month, year } = req.query;
    const summary = await managerService.getTeamAttendanceSummary(ManagerEmpID, parseInt(month), parseInt(year));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchTeamMembers = async (req, res) => {
  try {
    const { ManagerEmpID, search } = req.query;
    const result = await managerService.searchTeamMembers(ManagerEmpID, search);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { ToEmpID, ...data } = req.body;
    const result = await managerService.assignTask(ToEmpID, data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { EmpID, ...data } = req.body;
    const result = await managerService.updateTeamMember(EmpID, data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamPerformance = async (req, res) => {
  try {
    const result = await managerService.getTeamPerformance(req.query.ManagerEmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
