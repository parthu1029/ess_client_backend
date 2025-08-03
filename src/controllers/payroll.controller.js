const payrollService = require('../services/payroll.service');

// Most recent payslip
exports.getPayslip = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const payslip = await payrollService.getPayslip(EmpID);
    res.json(payslip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// History
exports.getPayslipHistory = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const history = await payrollService.getPayslipHistory(EmpID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download payslip BLOB
exports.downloadPayslip = async (req, res) => {
  try {
    const { EmpID, Period } = req.query;
    const blob = await payrollService.downloadPayslip(EmpID, Period);
    if (blob) {
      res.set('Content-Type', 'application/pdf');
      res.send(blob);
    } else {
      res.status(404).json({ error: "Payslip not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    const EmpID = req.body.EmpID;
    const details = await payrollService.updateBankDetails(EmpID, req.body.details);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const details = await payrollService.getBankDetails(EmpID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSalaryBreakdown = async (req, res) => {
  try {
    const { EmpID, Period } = req.query;
    const breakdown = await payrollService.getSalaryBreakdown(EmpID, Period);
    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTaxDocuments = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const docs = await payrollService.getTaxDocuments(EmpID);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPayrollSummary = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    const summary = await payrollService.getPayrollSummary(EmpID);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generatePayrollReport = async (req, res) => {
  try {
    const result = await payrollService.generatePayrollReport(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSalaryStructure = async (req, res) => {
  try {
    const EmpID = req.body.EmpID;
    const structure = await payrollService.updateSalaryStructure(EmpID, req.body.structure);
    res.json(structure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
