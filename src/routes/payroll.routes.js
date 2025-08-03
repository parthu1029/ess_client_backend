const express = require('express');
const payrollController = require('../controllers/payroll.controller');
const router = express.Router();

router.get('/payslip', payrollController.getPayslip);
router.get('/getPayslipHistory', payrollController.getPayslipHistory);
router.put('/updateBankDetails', payrollController.updateBankDetails);
router.get('/payslipDownload', payrollController.downloadPayslip);
router.get('/getSalaryBreakdown', payrollController.getSalaryBreakdown);
router.get('/getTaxDocuments', payrollController.getTaxDocuments);
router.get('/getPayrollSummary', payrollController.getPayrollSummary);
router.get('/getBankDetails', payrollController.getBankDetails);
router.post('/generatePayrollReport', payrollController.generatePayrollReport);
router.put('/updateSalaryStructure', payrollController.updateSalaryStructure);

module.exports = router;
