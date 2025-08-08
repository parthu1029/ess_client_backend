const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get most recent payslip for an employee
async function getPayslip(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT TOP 1 * FROM PayslipTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID ORDER BY Period DESC');
  return res.recordset[0];
}

// Get payslip history for employee
async function getPayslipHistory(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM PayslipTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID ORDER BY Period DESC');
  return res.recordset;
}

async function getPayrollSummary(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT COUNT(*) as PayslipCount, MIN(Period) as Earliest, MAX(Period) as Latest FROM PayslipTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return res.recordset[0];
}


module.exports = {
  getPayslip,
  getPayslipHistory,
  getPayrollSummary,
};
