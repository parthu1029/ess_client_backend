const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Submit a new reimbursement request (with optional attachment)
async function submitReimbursement(data, fileBuffer = null) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), data.ReimbursementID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('Attachment', sql.VarBinary(sql.MAX), fileBuffer)
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('Type', sql.VarChar(20), data.Type)
    .input('Amount', sql.Int, data.Amount)
    .input('Date', sql.Date, data.Date)
    .input('Description', sql.VarChar(100), data.Description)
    .query(`
      INSERT INTO ReimbursementReqTable
      (ReimbursementID, EmpID, Attachment, Status, Type, Amount, Date, Description)
      VALUES
      (@ReimbursementID, @EmpID, @Attachment, @Status, @Type, @Amount, @Date, @Description)
    `);
}

// Get reimbursement history for an employee
async function getReimbursementHistory(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ReimbursementReqTable WHERE EmpID=@EmpID ORDER BY Date DESC');
  return res.recordset;
}

// Get status for a reimbursement by ID
async function getReimbursementStatus(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('SELECT Status FROM ReimbursementReqTable WHERE ReimbursementID=@ReimbursementID');
  return res.recordset[0];
}

// Approve or reject reimbursement
async function approveRejectReimbursement(ReimbursementID, action) {
  const pool = await sql.connect(dbConfig);
  const status = action === 'approve' ? 'Approved' : 'Rejected';
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('Status', sql.VarChar(15), status)
    .query('UPDATE ReimbursementReqTable SET Status=@Status WHERE ReimbursementID=@ReimbursementID');
}

// Unique reimbursement types
async function getReimbursementTypes() {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT DISTINCT Type FROM ReimbursementReqTable');
  return res.recordset.map(r => r.Type);
}

// Get pending reimbursements for an employee
async function getPendingReimbursements(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ReimbursementReqTable WHERE Status=\'Pending\' AND EmpID=@EmpID ORDER BY Date DESC');
  return res.recordset;
}

// Cancel a reimbursement (set status)
async function cancelReimbursement(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('UPDATE ReimbursementReqTable SET Status=\'Cancelled\' WHERE ReimbursementID=@ReimbursementID');
}

// Get reimbursement by ID
async function getReimbursementById(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('SELECT * FROM ReimbursementReqTable WHERE ReimbursementID=@ReimbursementID');
  return res.recordset[0];
}

// Download attached receipt
async function downloadReceipt(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('SELECT Attachment FROM ReimbursementReqTable WHERE ReimbursementID=@ReimbursementID');
  return res.recordset[0]?.Attachment || null;
}

// "Summary" - count, total, etc for one employee
async function getReimbursementSummary(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT COUNT(*) AS TotalRequests, SUM(Amount) AS TotalAmount FROM ReimbursementReqTable WHERE EmpID=@EmpID');
  return res.recordset[0];
}

// Transactions: same as history (no transaction log table in ERD)
async function getReimbursementTransactions(EmpID) {
  return getReimbursementHistory(EmpID);
}

// All requests for employee
async function getReimbursementRequestDetails(EmpID) {
  return getReimbursementHistory(EmpID);
}

// Submit a new request (synonym)
async function submitReimbursementRequest(data, fileBuffer = null) {
  return submitReimbursement(data, fileBuffer);
}

// Submit on behalf (synonym)
async function submitReimbursementRequestOnBehalf(data, fileBuffer = null) {
  return submitReimbursement(data, fileBuffer);
}

// Edit (patch)
async function editReimbursementRequest(ReimbursementID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('Type', sql.VarChar(20), updateData.Type)
    .input('Amount', sql.Int, updateData.Amount)
    .input('Date', sql.Date, updateData.Date)
    .input('Description', sql.VarChar(100), updateData.Description)
    .query(`
      UPDATE ReimbursementReqTable
      SET Type=@Type, Amount=@Amount, Date=@Date, Description=@Description
      WHERE ReimbursementID=@ReimbursementID
    `);
}

// Save as draft (status = 'Draft')
async function draftSaveReimbursementRequest(data, fileBuffer = null) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), data.ReimbursementID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('Attachment', sql.VarBinary(sql.MAX), fileBuffer)
    .input('Status', sql.VarChar(15), 'Draft')
    .input('Type', sql.VarChar(20), data.Type)
    .input('Amount', sql.Int, data.Amount)
    .input('Date', sql.Date, data.Date)
    .input('Description', sql.VarChar(100), data.Description)
    .query(`
      INSERT INTO ReimbursementReqTable
      (ReimbursementID, EmpID, Attachment, Status, Type, Amount, Date, Description)
      VALUES
      (@ReimbursementID, @EmpID, @Attachment, @Status, @Type, @Amount, @Date, @Description)
    `);
}

// "Delegate" - not supported in ERD (no ApproverID field)
// Skipped; can return a stub if you want

// Change approval/status
async function changeReimbursementApproval(ReimbursementID, newStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('Status', sql.VarChar(15), newStatus)
    .query('UPDATE ReimbursementReqTable SET Status=@Status WHERE ReimbursementID=@ReimbursementID');
}

// Approve/reject (patch synonym)
async function approveRejectReimbursementRequest(ReimbursementID, action) {
  return approveRejectReimbursement(ReimbursementID, action);
}

// All pending for user
async function getPendingReimbursementRequests(EmpID) {
  return getPendingReimbursements(EmpID);
}

// Pending details by ID
async function getPendingReimbursementRequestDetails(ReimbursementID) {
  return getReimbursementById(ReimbursementID);
}

module.exports = {
  submitReimbursement,
  getReimbursementHistory,
  getReimbursementStatus,
  approveRejectReimbursement,
  getReimbursementTypes,
  getPendingReimbursements,
  cancelReimbursement,
  getReimbursementById,
  downloadReceipt,
  getReimbursementSummary,
  getReimbursementTransactions,
  getReimbursementRequestDetails,
  submitReimbursementRequest,
  submitReimbursementRequestOnBehalf,
  editReimbursementRequest,
  draftSaveReimbursementRequest,
  changeReimbursementApproval,
  approveRejectReimbursementRequest,
  getPendingReimbursementRequestDetails,
  getPendingReimbursementRequests,
};
