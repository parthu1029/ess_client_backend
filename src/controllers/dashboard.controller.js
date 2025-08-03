const dashboardService = require('../services/dashboard.service');

exports.getDashboardData = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData(req.tenant.id, req.user?.id, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getEmployeeDashboard = async (req, res) => {
  try {
    const { empId } = req.params;
    const data = await dashboardService.getEmployeeDashboard(empId, req.tenant.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee dashboard data' });
  }
};

exports.getManagerDashboard = async (req, res) => {
  try {
    const { managerId } = req.params;
    const data = await dashboardService.getManagerDashboard(managerId, req.tenant.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manager dashboard data' });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const data = await dashboardService.getAttendanceStats(req.tenant.id, req.user?.id, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const data = await dashboardService.getRecentActivities(req.tenant.id, req.user?.id, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const { managerId } = req.params;
    const data = await dashboardService.getPendingApprovals(managerId, req.tenant.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

exports.getQuickStats = async (req, res) => {
  try {
    const { empId } = req.params;
    const data = await dashboardService.getQuickStats(empId, req.tenant.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quick statistics' });
  }
};

exports.getTeamOverview = async (req, res) => {
  try {
    const { managerId } = req.params;
    const data = await dashboardService.getTeamOverview(managerId, req.tenant.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team overview' });
  }
};

exports.getNotificationSummary = async (req, res) => {
  try {
    const data = await dashboardService.getNotificationSummary(req.tenant.id, req.user?.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification summary' });
  }
};

exports.refreshDashboard = async (req, res) => {
  try {
    const result = await dashboardService.refreshDashboard(req.body, req.tenant.id, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh dashboard' });
  }
};

exports.updateDashboardPreferences = async (req, res) => {
  try {
    const { empId } = req.params;
    const result = await dashboardService.updateDashboardPreferences(empId, req.tenant.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dashboard preferences' });
  }
};
