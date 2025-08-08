const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { randomBytes } = require('crypto');

function generateTimelineID() {
  return randomBytes(4).toString('hex');
}

// Submit a new reimbursement request (with optional attachment)
async function submitReimbursementRequest(data, fileBuffer = null, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;

  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), data.ReimbursementID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Attachment', sql.VarBinary(sql.MAX), fileBuffer)
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Type', sql.VarChar(20), data.Type)
    .input('Amount', sql.Int, data.Amount)
    .input('Date', sql.Date, data.Date)
    .input('Description', sql.VarChar(100), data.Description)
    .query(`
      INSERT INTO ReimbursementReqTable
      (ReimbursementID, EmpID, CompanyID, Attachment, Status, Type, Amount, Date, Description, approverEmpID)
      VALUES
      (@ReimbursementID, @EmpID, @CompanyID, @Attachment, @Status, @Type, @Amount, @Date, @Description, @approverEmpID)
    `);

  // Log creation in timeline
  const creationTimelineID = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), creationTimelineID)
    .input('reqID', sql.VarChar(30), data.ReimbursementID)
    .input('action', sql.VarChar(50), 'Created')
    .input('actorEmpID', sql.VarChar(30), EmpID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);

  // Log pending entry
  const pendingTimelineID = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), pendingTimelineID)
    .input('reqID', sql.VarChar(30), data.ReimbursementID)
    .input('action', sql.VarChar(50), 'Pending')
    .input('actorEmpID', sql.VarChar(30), managerID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
}

// Get reimbursement history for an employee
async function getReimbursementTransactions(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM ReimbursementReqTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID ORDER BY Date DESC');
  return res.recordset;
}

// Approve or reject reimbursement
async function approveRejectReimbursementRequest(ReimbursementID, action) {
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
async function getPendingReimbursementRequests(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM ReimbursementReqTable WHERE Status=\'Pending\' AND approverEmpID=@EmpID AND CompanyID=@CompanyID ORDER BY Date DESC');
  return res.recordset;
}

// Cancel a reimbursement (set status)
async function cancelReimbursementRequest(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('UPDATE ReimbursementReqTable SET Status=\'Cancelled\' WHERE ReimbursementID=@ReimbursementID');
}

// Get reimbursement by ID
async function getReimbursementRequestDetails(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('SELECT * FROM ReimbursementReqTable WHERE ReimbursementID=@ReimbursementID');
  return res.recordset[0];
}

// Submit on behalf (synonym)
async function submitReimbursementRequestOnBehalf(data, fileBuffer = null, EmpID, CompanyID) {
  return submitReimbursement(data, fileBuffer, EmpID, CompanyID);
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
async function draftSaveReimbursementRequest(data, fileBuffer = null, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), data.ReimbursementID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Attachment', sql.VarBinary(sql.MAX), fileBuffer)
    .input('Status', sql.VarChar(15), 'Draft')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Type', sql.VarChar(20), data.Type)
    .input('Amount', sql.Int, data.Amount)
    .input('Date', sql.Date, data.Date)
    .input('Description', sql.VarChar(100), data.Description)
    .query(`
      INSERT INTO ReimbursementReqTable
      (ReimbursementID, EmpID, CompanyID, Attachment, Status, Type, Amount, Date, Description, approverEmpID)
      VALUES
      (@ReimbursementID, @EmpID, @CompanyID, @Attachment, @Status, @Type, @Amount, @Date, @Description, @approverEmpID)
    `);
}

// Delegate reimbursement approval to another approver
async function delegateReimbursementApproval(ReimbursementID, newApproverEmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE ReimbursementReqTable SET approverEmpID=@approverEmpID WHERE ReimbursementID=@ReimbursementID');
}

// Change approval/status
async function changeReimbursementApproval(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('Status', sql.VarChar(15), 'change request')
    .query('UPDATE ReimbursementReqTable SET Status=@Status WHERE ReimbursementID=@ReimbursementID');
}

// Pending details by ID
async function getPendingReimbursementRequestDetails(reqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('reqID', sql.VarChar(30), reqID)
    .query('SELECT * FROM ReimbursementReqTable WHERE Status=\'Pending\' AND ReimbursementID=@reqID ORDER BY createdDate DESC');
  return res.recordset;
}

module.exports = {
  getReimbursementTypes,
  cancelReimbursementRequest,
  getReimbursementTransactions,
  getReimbursementRequestDetails,
  submitReimbursementRequest,
  submitReimbursementRequestOnBehalf,
  editReimbursementRequest,
  draftSaveReimbursementRequest,
  changeReimbursementApproval,
  delegateReimbursementApproval,
  approveRejectReimbursementRequest,
  getPendingReimbursementRequestDetails,
  getPendingReimbursementRequests,
};
