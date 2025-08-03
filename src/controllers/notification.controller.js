const notificationService = require('../services/notification.service');

// All notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const data = await notificationService.getNotifications(EmpID);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const data = await notificationService.getUnreadNotifications(EmpID);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.body.NotificationID);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.body.EmpID);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteNotification(req.body.NotificationID, req.body.EmpID);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotificationAdmin = async (req, res) => {
  try {
    await notificationService.deleteNotificationAdmin(req.body.NotificationID);
    res.json({ message: 'Notification deleted by admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    await notificationService.createNotification(req.body);
    res.json({ message: 'Notification created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    // Get all employee IDs for broadcast (in real code, fetch from EmpProfileTable)
    const allEmpIDs = req.body.allEmpIDs;
    await notificationService.broadcastNotification(req.body, allEmpIDs);
    res.json({ message: 'Broadcast sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const result = await notificationService.getAllNotifications();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationSettings = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const settings = await notificationService.getNotificationSettings(EmpID);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const { EmpID, settings } = req.body;
    await notificationService.updateNotificationSettings(EmpID, settings);
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const { NotificationID } = req.query;
    const notif = await notificationService.getNotificationById(NotificationID);
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const stats = await notificationService.getNotificationStats(EmpID);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
