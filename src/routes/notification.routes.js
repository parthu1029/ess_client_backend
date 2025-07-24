const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Employee notification routes
router.get('/:empId', notificationController.getNotifications);
router.get('/unread/:empId', notificationController.getUnreadNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/mark-all-read/:empId', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

// Admin/Manager notification routes
router.post('/create', notificationController.createNotification);
router.post('/broadcast', notificationController.broadcastNotification);
router.get('/admin/all', notificationController.getAllNotifications);
router.delete('/admin/:notificationId', notificationController.deleteNotificationAdmin);

// Notification settings routes
router.get('/settings/:empId', notificationController.getNotificationSettings);
router.put('/settings/:empId', notificationController.updateNotificationSettings);

module.exports = router;
