const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const adminController = require('../controllers/adminController');

// Manager routes
router.get('/team/:managerId', managerController.getTeam);
router.put('/approve', managerController.bulkApprove);
router.get('/pending/:managerId', managerController.getPendingApprovals);

// Admin routes
router.post('/add-employee', adminController.addEmployee);
router.put('/status/:empId', adminController.toggleUserStatus);

module.exports = router;
