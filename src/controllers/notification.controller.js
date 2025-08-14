const notificationService = require('../services/notification.service');

// All notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    
    const data = await notificationService.getNotifications(req.cookies.empid, req.cookies.context.companyid);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    await notificationService.createNotification(req.body, req.cookies.empid, req.cookies.context.companyid);
    res.json({ message: 'Notification created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    // Get all employee IDs for broadcast (in real code, fetch from EmpProfileTable)
    const allEmpIDs = req.body.allEmpIDs;
    await notificationService.broadcastNotification(req.body, allEmpIDs, req.cookies.context.companyid);
    res.json({ message: 'Broadcast sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
