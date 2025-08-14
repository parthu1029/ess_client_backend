const payrollService = require('../services/payroll.service');

// Most recent payslip
exports.getPayslip = async (req, res) => {
  try {

    const payslip = await payrollService.getPayslip(req.cookies.empid, req.cookies.context.companyid);
    res.json(payslip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPayslipHistory = async (req, res) => {
  try {

    const history = await payrollService.getPayslipHistory(req.cookies.empid, req.cookies.context.companyid);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPayrollSummary = async (req, res) => {
  try {

    const summary = await payrollService.getPayrollSummary(req.cookies.empid, req.cookies.context.companyid);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};