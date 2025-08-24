const express = require('express');
const notificationController = require('../controllers/notification.controller');
const router = express.Router();

router.get('/getNotifications', notificationController.getNotifications);
router.post('/createNotification', notificationController.createNotification);
router.post('/broadcastNotification', notificationController.broadcastNotification);

module.exports = router;
