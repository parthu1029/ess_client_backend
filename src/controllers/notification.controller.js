const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
    try {
        const { empId } = req.params;
        const { page = 1, limit = 20, type, status } = req.query;
        
        const notifications = await notificationService.getNotifications(empId, {
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            status
        });
        
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.getUnreadNotifications = async (req, res) => {
    try {
        const { empId } = req.params;
        const unreadNotifications = await notificationService.getUnreadNotifications(empId);
        res.json(unreadNotifications);
    } catch (error) {
        console.error('Get unread notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch unread notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { empId } = req.body;
        
        await notificationService.markAsRead(notificationId, empId);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { empId } = req.params;
        
        const count = await notificationService.markAllAsRead(empId);
        res.json({ 
            message: 'All notifications marked as read',
            markedCount: count
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { empId } = req.body;
        
        await notificationService.deleteNotification(notificationId, empId);
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { targetEmpId, title, content, type, priority, scheduledFor } = req.body;
        const { senderEmpId } = req.body; // From authenticated user or admin
        
        const notificationId = await notificationService.createNotification({
            targetEmpId,
            senderEmpId,
            title,
            content,
            type,
            priority,
            scheduledFor
        });
        
        console.log(`NOTIFICATION CREATED: ${title} for ${targetEmpId}`);
        res.json({ 
            message: 'Notification created successfully',
            notificationId
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
};

exports.broadcastNotification = async (req, res) => {
    try {
        const { title, content, type, priority, targetGroups, excludeEmpIds } = req.body;
        const { senderEmpId } = req.body;
        
        const result = await notificationService.broadcastNotification({
            senderEmpId,
            title,
            content,
            type,
            priority,
            targetGroups, // ['all', 'managers', 'department:HR', 'grade:5+']
            excludeEmpIds
        });
        
        console.log(`BROADCAST NOTIFICATION: ${title} sent to ${result.sentCount} employees`);
        res.json({ 
            message: 'Broadcast notification sent successfully',
            sentCount: result.sentCount,
            failedCount: result.failedCount
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({ error: 'Failed to send broadcast notification' });
    }
};

exports.getAllNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 50, type, status, startDate, endDate } = req.query;
        
        const notifications = await notificationService.getAllNotifications({
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            status,
            startDate,
            endDate
        });
        
        res.json(notifications);
    } catch (error) {
        console.error('Get all notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch all notifications' });
    }
};

exports.deleteNotificationAdmin = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        await notificationService.deleteNotificationAdmin(notificationId);
        res.json({ message: 'Notification deleted by admin' });
    } catch (error) {
        console.error('Admin delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

exports.getNotificationSettings = async (req, res) => {
    try {
        const { empId } = req.params;
        const settings = await notificationService.getNotificationSettings(empId);
        res.json(settings);
    } catch (error) {
        console.error('Get notification settings error:', error);
        res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
};

exports.updateNotificationSettings = async (req, res) => {
    try {
        const { empId } = req.params;
        const settings = req.body;
        
        await notificationService.updateNotificationSettings(empId, settings);
        res.json({ message: 'Notification settings updated successfully' });
    } catch (error) {
        console.error('Update notification settings error:', error);
        res.status(500).json({ error: 'Failed to update notification settings' });
    }
};
