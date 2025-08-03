const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get most recent payslip for an employee
async function getPayslip(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT TOP 1 * FROM PayslipTable WHERE EmpID=@EmpID ORDER BY Period DESC');
  return res.recordset[0];
}

// Get payslip history for employee
async function getPayslipHistory(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM PayslipTable WHERE EmpID=@EmpID ORDER BY Period DESC');
  return res.recordset;
}

// Download a payslip (by EmpID and Period)
async function downloadPayslip(EmpID, Period) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Period', sql.Date, Period)
    .query('SELECT Attachment FROM PayslipTable WHERE EmpID=@EmpID AND Period=@Period');
  return res.recordset[0]?.Attachment || null;
}

// Stubs/empty for things not in ERD
async function updateBankDetails(EmpID, details) {
  return { error: "Bank details structure not in ERD." };
}
async function getBankDetails(EmpID) {
  return { error: "Bank details not modeled in current schema." };
}

async function getSalaryBreakdown(EmpID, Period) {
  return { error: "Salary structure/breakdown not available as per current schema." };
}
async function getTaxDocuments(EmpID) {
  return { error: "Tax documents are not tracked in the database ERD." };
}
async function getPayrollSummary(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT COUNT(*) as PayslipCount, MIN(Period) as Earliest, MAX(Period) as Latest FROM PayslipTable WHERE EmpID=@EmpID');
  return res.recordset[0];
}
async function generatePayrollReport(filter) {
  // Just returns list of payslips; real report logic would be external
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT * FROM PayslipTable');
  return res.recordset;
}
async function updateSalaryStructure(EmpID, structure) {
  return { error: "No salary structure table in current database." };
}

module.exports = {
  getPayslip,
  getPayslipHistory,
  downloadPayslip,
  updateBankDetails,
  getSalaryBreakdown,
  getTaxDocuments,
  getPayrollSummary,
  getBankDetails,
  generatePayrollReport,
  updateSalaryStructure,
};
