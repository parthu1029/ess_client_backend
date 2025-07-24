const excuseService = require('../services/excuseService');
const notificationService = require('../services/notificationService');

exports.submitExcuse = async (req, res) => {
    try {
        const { empId, type, reason, excuseDate, duration } = req.body;
        
        let attachmentData = null;
        if (req.file) {
            attachmentData = {
                buffer: req.file.buffer,
                fileName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size
            };
        }
        
        const excuseId = await excuseService.submitExcuse({
            empId,
            type,
            reason,
            excuseDate,
            duration,
            attachmentData
        });
        
        // Get manager ID and send notification
        const managerId = await excuseService.getManagerId(empId);
        if (managerId) {
            await notificationService.sendNotification(
                managerId,
                'New Excuse Request',
                `Excuse request for ${type} from ${empId}`,
                'excuse'
            );
        }
        
        console.log(`EXCUSE: ${empId} submitted ${type} excuse for ${excuseDate}`);
        res.json({ 
            message: 'Excuse request submitted successfully',
            excuseId 
        });
    } catch (error) {
        console.error('Excuse submission error:', error);
        res.status(500).json({ error: 'Failed to submit excuse request' });
    }
};

exports.getExcuseHistory = async (req, res) => {
    try {
        const { empId } = req.params;
        const { startDate, endDate, status } = req.query;
        
        const history = await excuseService.getExcuseHistory(empId, {
            startDate,
            endDate,
            status
        });
        
        res.json(history);
    } catch (error) {
        console.error('Excuse history error:', error);
        res.status(500).json({ error: 'Failed to fetch excuse history' });
    }
};

exports.getExcuseStatus = async (req, res) => {
    try {
        const { empId } = req.params;
        const status = await excuseService.getExcuseStatus(empId);
        res.json(status);
    } catch (error) {
        console.error('Excuse status error:', error);
        res.status(500).json({ error: 'Failed to fetch excuse status' });
    }
};

exports.approveRejectExcuse = async (req, res) => {
    try {
        const { excuseId } = req.params;
        const { action, remarks, managerId } = req.body;
        
        const result = await excuseService.approveRejectExcuse(excuseId, action, remarks);
        
        // Send notification to employee
        await notificationService.sendNotification(
            result.empId,
            'Excuse Request Update',
            `Your excuse request has been ${action}d`,
            'excuse'
        );
        
        res.json({ message: `Excuse request ${action}d successfully` });
    } catch (error) {
        console.error('Excuse approval error:', error);
        res.status(500).json({ error: 'Failed to process excuse approval' });
    }
};

exports.getPendingExcuses = async (req, res) => {
    try {
        const { managerId } = req.params;
        const pending = await excuseService.getPendingExcuses(managerId);
        res.json(pending);
    } catch (error) {
        console.error('Pending excuses error:', error);
        res.status(500).json({ error: 'Failed to fetch pending excuses' });
    }
};

exports.cancelExcuse = async (req, res) => {
    try {
        const { excuseId } = req.params;
        const { empId } = req.body;
        
        await excuseService.cancelExcuse(excuseId, empId);
        res.json({ message: 'Excuse request cancelled successfully' });
    } catch (error) {
        console.error('Excuse cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel excuse request' });
    }
};

exports.getExcuseTypes = async (req, res) => {
    try {
        const types = await excuseService.getExcuseTypes();
        res.json(types);
    } catch (error) {
        console.error('Excuse types error:', error);
        res.status(500).json({ error: 'Failed to fetch excuse types' });
    }
};
