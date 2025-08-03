const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Submit new excuse with optional attachment
async function submitExcuse(data, attachment) {
  const pool = await sql.connect(dbConfig);

  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), data.ExcuseReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('From', sql.DATE, data.From)
    .input('To', sql.DATE, data.To)
    .input('Attachment', sql.BLOB, attachment ? attachment : null) // If uploading as blob
    .input('ReqSubmittedDate', sql.DATE, data.ReqSubmittedDate || new Date())
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('Date', sql.DATE, data.Date)
    .input('Reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO ExcuseReqTable
      (ExcuseReqID, EmpID, [From], [To], Attachment, ReqSubmittedDate, Status, Date, Reason)
      VALUES 
      (@ExcuseReqID, @EmpID, @From, @To, @Attachment, @ReqSubmittedDate, @Status, @Date, @Reason)
    `);
}

// Get excuse history for an employee
async function getExcuseHistory(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ExcuseReqTable WHERE EmpID = @EmpID ORDER BY ReqSubmittedDate DESC');
  return res.recordset;
}

// Get status of a specific excuse (by ExcuseReqID)
async function getExcuseStatusById(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT Status FROM ExcuseReqTable WHERE ExcuseReqID = @ExcuseReqID');
  return res.recordset[0];
}

// Get grouped status summary for employee
async function getExcuseStatusForEmp(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT Status, COUNT(*) as Count FROM ExcuseReqTable WHERE EmpID=@EmpID GROUP BY Status');
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

// Get all pending excuses for approval by status (Pending)
async function getPendingExcuses(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query(`SELECT * FROM ExcuseReqTable WHERE Status='Pending' AND EmpID=@EmpID ORDER BY ReqSubmittedDate DESC`);
  return res.recordset;
}

// Cancel excuse by setting status to 'Cancelled'
async function cancelExcuse(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query(`UPDATE ExcuseReqTable SET Status='Cancelled' WHERE ExcuseReqID=@ExcuseReqID`);
}

// Get excuse by ID (metadata & attachment)
async function getExcuseById(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE ExcuseReqID = @ExcuseReqID');
  return res.recordset[0];
}

// Download attachment for an excuse (BLOB)
async function downloadExcuseAttachment(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT Attachment FROM ExcuseReqTable WHERE ExcuseReqID = @ExcuseReqID');
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
      (ExcuseReqID, EmpID, [From], [To], Attachment, ReqSubmittedDate, Status, Date, Reason)
      VALUES 
      (@ExcuseReqID, @EmpID, @From, @To, @Attachment, @ReqSubmittedDate, @Status, @Date, @Reason)
    `);
}

// Get all pending excuse requests for an employee
async function getPendingExcuseRequests(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ExcuseReqTable WHERE Status = \'Pending\' AND EmpID = @EmpID ORDER BY ReqSubmittedDate DESC');
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

module.exports = {
  submitExcuse,
  getExcuseHistory,
  getExcuseStatusById,
  getExcuseStatusForEmp,
  approveRejectExcuse,
  getPendingExcuses,
  cancelExcuse,
  getExcuseById,
  downloadExcuseAttachment,
  editExcuseRequest,
  draftSaveExcuseRequest,
  getPendingExcuseRequests,
  getPendingExcuseRequestDetails,
};
