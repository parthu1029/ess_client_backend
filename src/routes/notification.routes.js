const express = require('express');
const notificationController = require('../controllers/notification.controller');
const router = express.Router();

router.get('/getNotifications', notificationController.getNotifications);
router.get('/getUnreadNotifications', notificationController.getUnreadNotifications);
router.put('/markAsRead', notificationController.markAsRead);
router.put('/markAllAsRead', notificationController.markAllAsRead);
router.delete('/deleteNotification', notificationController.deleteNotification);
router.post('/createNotification', notificationController.createNotification);
router.post('/broadcaseNotification', notificationController.broadcastNotification);
router.get('/getAllNotification', notificationController.getAllNotifications);
router.delete('/deleteNotificationAdmin', notificationController.deleteNotificationAdmin);
router.get('/getNotificationSettings', notificationController.getNotificationSettings);
router.put('/updateNotificationSettings', notificationController.updateNotificationSettings);
router.get('/getNotificationById', notificationController.getNotificationById);
router.get('/getNotificationStats', notificationController.getNotificationStats);

module.exports = router;
