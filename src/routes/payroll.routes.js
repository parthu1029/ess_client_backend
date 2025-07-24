const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

router.get('/payslip/:empId', payrollController.getPayslip);
router.get('/history/:empId', payrollController.getPayslipHistory);
router.put('/bank-details/:empId', payrollController.updateBankDetails);

module.exports = router;
