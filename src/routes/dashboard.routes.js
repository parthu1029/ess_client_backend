const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/getDashboardData', dashboardController.getDashboardData);

router.get('/getEmployeeDashboard', dashboardController.getEmployeeDashboard);

router.get('/getManagerDashboard', dashboardController.getManagerDashboard);

router.get('/getAttendanceStats', dashboardController.getAttendanceStats);

router.get('/getRecentActivities', dashboardController.getRecentActivities);

router.get('/getPendingApprovals', dashboardController.getPendingApprovals);

router.get('/getQuickStats', dashboardController.getQuickStats);

router.get('/getTeamOverview', dashboardController.getTeamOverview);

router.get('/getNotificationSummary', dashboardController.getNotificationSummary);

router.post('/refreshDashboard', dashboardController.refreshDashboard);

router.put('/updateDashboardPreferences', dashboardController.updateDashboardPreferences);

module.exports = router;
