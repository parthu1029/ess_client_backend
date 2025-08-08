const express = require('express');
const payrollController = require('../controllers/payroll.controller');
const router = express.Router();

router.get('/payslip', payrollController.getPayslip);
router.get('/getPayslipHistory', payrollController.getPayslipHistory);
router.get('/getPayrollSummary', payrollController.getPayrollSummary);

module.exports = router;
