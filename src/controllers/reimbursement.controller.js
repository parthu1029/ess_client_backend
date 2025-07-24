const reimbursementService = require('../services/reimbursementService');
const notificationService = require('../services/notificationService');

exports.submitReimbursement = async (req, res) => {
    try {
        const { empId, type, amount, comment, expenseDate } = req.body;
        
        let receiptData = null;
        if (req.file) {
            receiptData = {
                buffer: req.file.buffer,
                fileName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size
            };
        }
        
        const reimbursementId = await reimbursementService.submitReimbursement({
            empId,
            type,
            amount: parseFloat(amount),
            comment,
            expenseDate,
            receiptData
        });
        
        // Get manager ID and send notification
        const managerId = await reimbursementService.getManagerId(empId);
        if (managerId) {
            await notificationService.sendNotification(
                managerId,
                'New Reimbursement Request',
                `Reimbursement request of ₹${amount} from ${empId}`,
                'reimbursement'
            );
        }
        
        console.log(`REIMBURSEMENT: ${empId} submitted ${type} claim for ₹${amount}`);
        res.json({ 
            message: 'Reimbursement request submitted successfully',
            reimbursementId 
        });
    } catch (error) {
        console.error('Reimbursement submission error:', error);
        res.status(500).json({ error: 'Failed to submit reimbursement request' });
    }
};

exports.getReimbursementHistory = async (req, res) => {
    try {
        const { empId } = req.params;
        const { startDate, endDate, status } = req.query;
        
        const history = await reimbursementService.getReimbursementHistory(empId, {
            startDate,
            endDate,
            status
        });
        
        res.json(history);
    } catch (error) {
        console.error('Reimbursement history error:', error);
        res.status(500).json({ error: 'Failed to fetch reimbursement history' });
    }
};

exports.getReimbursementStatus = async (req, res) => {
    try {
        const { empId } = req.params;
        const status = await reimbursementService.getReimbursementStatus(empId);
        res.json(status);
    } catch (error) {
        console.error('Reimbursement status error:', error);
        res.status(500).json({ error: 'Failed to fetch reimbursement status' });
    }
};

exports.approveRejectReimbursement = async (req, res) => {
    try {
        const { reimbursementId } = req.params;
        const { action, remarks, managerId } = req.body;
        
        const result = await reimbursementService.approveRejectReimbursement(
            reimbursementId, 
            action, 
            remarks
        );
        
        // Send notification to employee
        await notificationService.sendNotification(
            result.empId,
            'Reimbursement Update',
            `Your reimbursement request has been ${action}d`,
            'reimbursement'
        );
        
        res.json({ message: `Reimbursement request ${action}d successfully` });
    } catch (error) {
        console.error('Reimbursement approval error:', error);
        res.status(500).json({ error: 'Failed to process reimbursement approval' });
    }
};

exports.getReimbursementTypes = async (req, res) => {
    try {
        const types = await reimbursementService.getReimbursementTypes();
        res.json(types);
    } catch (error) {
        console.error('Reimbursement types error:', error);
        res.status(500).json({ error: 'Failed to fetch reimbursement types' });
    }
};

exports.getPendingReimbursements = async (req, res) => {
    try {
        const { managerId } = req.params;
        const pending = await reimbursementService.getPendingReimbursements(managerId);
        res.json(pending);
    } catch (error) {
        console.error('Pending reimbursements error:', error);
        res.status(500).json({ error: 'Failed to fetch pending reimbursements' });
    }
};

exports.cancelReimbursement = async (req, res) => {
    try {
        const { reimbursementId } = req.params;
        const { empId } = req.body;
        
        await reimbursementService.cancelReimbursement(reimbursementId, empId);
        res.json({ message: 'Reimbursement request cancelled successfully' });
    } catch (error) {
        console.error('Reimbursement cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel reimbursement request' });
    }
};
