const managerService = require('../services/managerService');

exports.getTeam = async (req, res) => {
    try {
        const { managerId } = req.params;
        const team = await managerService.getTeam(managerId);
        res.json(team);
    } catch (error) {
        console.error('Team fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
};

exports.bulkApprove = async (req, res) => {
    try {
        const { type, ids, action, managerId } = req.body;
        
        await managerService.bulkApprove(type, ids, action, managerId);
        res.json({ message: `${type} requests ${action}d successfully` });
    } catch (error) {
        console.error('Bulk approval error:', error);
        res.status(500).json({ error: 'Failed to process bulk approval' });
    }
};

exports.getPendingApprovals = async (req, res) => {
    try {
        const { managerId } = req.params;
        const approvals = await managerService.getPendingApprovals(managerId);
        res.json(approvals);
    } catch (error) {
        console.error('Pending approvals error:', error);
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
};
exports.getTeamMemberDetails = async (req, res) => {
    try {
        const { managerId, empId } = req.params;
        const member = await managerService.getTeamMemberDetails(managerId, empId);
        
        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        
        res.json(member);
    } catch (error) {
        console.error('Team member details error:', error);
        res.status(500).json({ error: 'Failed to fetch team member details' });
    }
};

exports.getManagerDashboard = async (req, res) => {
    try {
        const { managerId } = req.params;
        const dashboard = await managerService.getManagerDashboard(managerId);
        res.json(dashboard);
    } catch (error) {
        console.error('Manager dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch manager dashboard' });
    }
};

exports.getTeamAttendanceSummary = async (req, res) => {
    try {
        const { managerId } = req.params;
        const { month, year } = req.query;
        
        const summary = await managerService.getTeamAttendanceSummary(managerId, { month, year });
        res.json(summary);
    } catch (error) {
        console.error('Team attendance summary error:', error);
        res.status(500).json({ error: 'Failed to fetch team attendance summary' });
    }
};

exports.searchTeamMembers = async (req, res) => {
    try {
        const { managerId } = req.params;
        const { query } = req.query;
        
        const members = await managerService.searchTeamMembers(managerId, query);
        res.json(members);
    } catch (error) {
        console.error('Team search error:', error);
        res.status(500).json({ error: 'Failed to search team members' });
    }
};