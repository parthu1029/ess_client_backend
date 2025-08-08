const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { randomBytes } = require('crypto');

function generateTimelineID() {
  return randomBytes(4).toString('hex');
}

// Submit new excuse with optional attachment
async function submitExcuseRequest(data, attachment) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;


  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), data.ExcuseReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('From', sql.DATE, data.From)
    .input('To', sql.DATE, data.To)
    .input('Attachment', sql.BLOB, attachment ? attachment : null) // If uploading as blob
    .input('ReqSubmittedDate', sql.DATE, data.ReqSubmittedDate || new Date())
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Date', sql.DATE, data.Date)
    .input('Reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO ExcuseReqTable
      (ExcuseReqID, EmpID, [From], [To], Attachment, ReqSubmittedDate, Status, approverEmpID, Date, Reason)
      VALUES 
      (@ExcuseReqID, @EmpID, @From, @To, @Attachment, @ReqSubmittedDate, @Status, @approverEmpID, @Date, @Reason)
    `);
}

// Get excuse history for an employee
async function getExcuseTransactions(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ExcuseReqTable WHERE EmpID = @EmpID ORDER BY ReqSubmittedDate DESC');
  return res.recordset;
}

// Approve or reject an excuse
async function approveRejectExcuse(ExcuseReqID, action, comments) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
    .query(`UPDATE ExcuseReqTable SET Status=@Status WHERE ExcuseReqID=@ExcuseReqID`);
}

// Cancel excuse by setting status to 'Cancelled'
async function cancelExcuse(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query(`UPDATE ExcuseReqTable SET Status='Cancelled' WHERE ExcuseReqID=@ExcuseReqID`);
}

// Get excuse by ID (metadata & attachment)
async function getExcuseRequestDetails(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE ExcuseReqID = @ExcuseReqID');
  return res.recordset[0];
}

// Edit (patch) excuse request
async function editExcuseRequest(ExcuseReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('From', sql.DATE, updateData.From)
    .input('To', sql.DATE, updateData.To)
    .input('Reason', sql.VarChar(100), updateData.Reason)
    .query(`UPDATE ExcuseReqTable SET [From]=@From, [To]=@To, Reason=@Reason WHERE ExcuseReqID=@ExcuseReqID`);
}

// Save as draft
async function draftSaveExcuseRequest(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), data.ExcuseReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('From', sql.DATE, data.From)
    .input('To', sql.DATE, data.To)
    .input('Attachment', sql.BLOB, data.Attachment || null)
    .input('ReqSubmittedDate', sql.DATE, data.ReqSubmittedDate || new Date())
    .input('Status', sql.VarChar(15), 'Draft')
    .input('Date', sql.DATE, data.Date)
    .input('Reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO ExcuseReqTable
      (ExcuseReqID, EmpID, [From], [To], Attachment, ReqSubmittedDate, Status, approverEmpID, Date, Reason)
      VALUES 
      (@ExcuseReqID, @EmpID, @From, @To, @Attachment, @ReqSubmittedDate, @Status, @approverEmpID, @Date, @Reason)
    `);
}

// Get all pending excuse requests for an employee
async function getPendingExcuseRequests(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ExcuseReqTable WHERE Status = \'Pending\' AND approverEmpID = @EmpID ORDER BY ReqSubmittedDate DESC');
  return res.recordset;
}

// Get details for a pending excuse request
async function getPendingExcuseRequestDetails(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE ExcuseReqID=@ExcuseReqID');
  return res.recordset[0];
}

// Change excuse approval (status)
async function changeExcuseApproval(ExcuseReqID, approvalStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('Status', sql.VarChar(15), approvalStatus)
    .query('UPDATE ExcuseReqTable SET Status=@Status WHERE ExcuseReqID=@ExcuseReqID');
}

// Delegate excuse approval (assign to new approver)
async function delegateExcuseApproval(ExcuseReqID, newApproverEmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE ExcuseReqTable SET approverEmpID=@approverEmpID WHERE ExcuseReqID=@ExcuseReqID');
}

// Submit excuse on behalf of another employee
async function submitExcuseOnBehalf(data, attachment) {
  return await submitExcuseRequest(data, attachment);
}

// Get excuse transactions (history) for an employee
async function getExcuseTransactions(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ExcuseReqTable WHERE EmpID = @EmpID ORDER BY ReqSubmittedDate DESC');
  return res.recordset;
}

// Get full details for a specific excuse request
async function getExcuseRequestDetails(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE ExcuseReqID = @ExcuseReqID');
  return res.recordset[0];
}

// Get distinct excuse types
async function getExcuseTypes() {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT DISTINCT Reason FROM ExcuseReqTable');
  return res.recordset.map(r => r.Reason);
}

module.exports = {
  submitExcuseRequest,
  submitExcuseOnBehalf,
  getExcuseTransactions,
  approveRejectExcuse,
  cancelExcuse,
  getExcuseRequestDetails,
  editExcuseRequest,
  draftSaveExcuseRequest,
  getExcuseTypes,
  getPendingExcuseRequests,
  getPendingExcuseRequestDetails,
  changeExcuseApproval,
  delegateExcuseApproval,
};
