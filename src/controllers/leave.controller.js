const leaveService = require('../services/leaveService');
const notificationService = require('../services/notificationService');

exports.applyLeave = async (req, res) => {
    try {
        const { leaveId, empId, fromDate, toDate, type } = req.body;
        
        // Check for conflicts
        const hasConflict = await leaveService.checkDateConflicts(empId, fromDate, toDate);
        if (hasConflict) {
            return res.status(400).json({ error: 'Leave dates conflict with existing requests' });
        }
        
        // Apply for leave
        await leaveService.applyLeave({ leaveId, empId, fromDate, toDate, type });
        
        // Get manager and send notification
        const managerId = await leaveService.getManagerId(empId);
        if (managerId) {
            await notificationService.sendNotification(
                managerId, 
                'New Leave Request', 
                `Leave request from ${empId}`, 
                'leave'
            );
        }
        
        res.json({ message: 'Leave application submitted successfully' });
    } catch (error) {
        console.error('Leave application error:', error);
        res.status(500).json({ error: 'Failed to apply for leave' });
    }
};

exports.getLeaveBalance = async (req, res) => {
    try {
        const { empId } = req.params;
        const balance = await leaveService.getLeaveBalance(empId);
        res.json(balance);
    } catch (error) {
        console.error('Leave balance error:', error);
        res.status(500).json({ error: 'Failed to fetch leave balance' });
    }
};

exports.getLeaveHistory = async (req, res) => {
    try {
        const { empId } = req.params;
        const history = await leaveService.getLeaveHistory(empId);
        res.json(history);
    } catch (error) {
        console.error('Leave history error:', error);
        res.status(500).json({ error: 'Failed to fetch leave history' });
    }
};

exports.getLeaveTypes = async (req, res) => {
    try {
        const types = await leaveService.getLeaveTypes();
        res.json(types);
    } catch (error) {
        console.error('Leave types error:', error);
        res.status(500).json({ error: 'Failed to fetch leave types' });
    }
};


exports.getLeaveStatus = async (req, res) => {
    try {
        const { empId } = req.params;
        const status = await leaveService.getLeaveStatus(empId);
        res.json(status);
    } catch (error) {
        console.error('Leave status error:', error);
        res.status(500).json({ error: 'Failed to fetch leave status' });
    }
};

exports.cancelLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { empId } = req.body; // From request body or token
        
        await leaveService.cancelLeave(leaveId, empId);
        res.json({ message: 'Leave cancelled successfully' });
    } catch (error) {
        console.error('Leave cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel leave' });
    }
};

exports.approveRejectLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { action, remarks, managerId } = req.body;
        
        const result = await leaveService.approveRejectLeave(leaveId, action, remarks);
        
        // Send notification to employee
        await notificationService.sendNotification(
            result.empId, 
            'Leave Request Update', 
            `Your leave request has been ${action}d`, 
            'leave'
        );
        
        res.json({ message: `Leave request ${action}d successfully` });
    } catch (error) {
        console.error('Leave approval error:', error);
        res.status(500).json({ error: 'Failed to process leave approval' });
    }
};
