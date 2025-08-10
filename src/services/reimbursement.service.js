const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { randomBytes } = require('crypto');
const { generateRequestId, generateAttachmentID } = require('../utils/ids');

function generateTimelineID() {
  return randomBytes(4).toString('hex');
}

// Submit a new reimbursement request (with optional attachment)
async function submitReimbursementRequest(data, fileBuffer = null, fileName = null, fileType = null, fileSize = null, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;

  const ReimbursementID = generateRequestId();
  let attachmentID = null;
    if (fileBuffer) {
      attachmentID = generateAttachmentID();
      await pool.request()
        .input('attachmentID', sql.VarChar(30), attachmentID)
        .input('fileName', sql.VarChar(255), fileName)
        .input('fileType', sql.VarChar(100), fileType)
        .input('fileSize', sql.Int, fileSize)
        .input('content', sql.VarBinary(sql.MAX), fileBuffer)
        .input('uploadedDate', sql.DateTime, new Date())
        .query(`
          INSERT INTO AttachmentsTable (attachmentID, fileName, fileType, fileSize, content, uploadedDate)
          VALUES (@attachmentID, @fileName, @fileType, @fileSize, @content, @uploadedDate)
        `);
    }
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('AttachmentID', sql.VarChar(30), attachmentID)
    .input('Status', sql.VarChar(15), 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Type', sql.VarChar(20), data.type)
    .input('Amount', sql.Int, data.amount)
    .input('Date', sql.Date, data.date)
    .input('Description', sql.VarChar(100), data.description)
    .input('reqSubmittedDate', sql.Date, new Date())
    .query(`
      INSERT INTO ReimbursementReqTable
      (reimbursementReqID, empID, companyID, attachmentID, status, type, amount, date, description, approverEmpID, reqSubmittedDate)
      VALUES
      (@ReimbursementID, @EmpID, @CompanyID, @AttachmentID, @Status, @Type, @Amount, @Date, @Description, @approverEmpID, @reqSubmittedDate)
    `);

  // Log creation in timeline
  const creationTimelineID = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), creationTimelineID)
    .input('reqID', sql.VarChar(30), ReimbursementID)
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
    .input('reqID', sql.VarChar(30), ReimbursementID)
    .input('action', sql.VarChar(50), 'Pending')
    .input('actorEmpID', sql.VarChar(30), managerID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
  return ReimbursementID;
}

// Get reimbursement history for an employee
async function getReimbursementTransactions(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM ReimbursementReqTable WHERE empID=@EmpID ORDER BY Date DESC');
  return res.recordset;
}

// Approve or reject reimbursement
async function approveRejectReimbursementRequest(ReimbursementID, action) {
  const pool = await sql.connect(dbConfig);
  const status = action === 'approve' ? 'Approved' : 'Rejected';
  await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .input('Status', sql.VarChar(15), status)
    .query('UPDATE ReimbursementReqTable SET status=@Status WHERE reimbursementReqID=@ReimbursementID');
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
    .query('UPDATE ReimbursementReqTable SET Status=\'Cancelled\' WHERE reimbursementReqID=@ReimbursementID');
}

// Get reimbursement by ID
async function getReimbursementRequestDetails(ReimbursementID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReimbursementID', sql.VarChar(30), ReimbursementID)
    .query('SELECT * FROM ReimbursementReqTable WHERE reimbursementReqID=@ReimbursementID');
  return res.recordset[0];
}

// Submit on behalf (synonym)
async function submitReimbursementRequestOnBehalf(data, fileBuffer = null, fileName = null, fileType = null, fileSize = null, EmpID, CompanyID) {
  return submitReimbursementRequest(data, fileBuffer, fileName, fileType, fileSize, EmpID, CompanyID);
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
      WHERE reimbursementReqID=@ReimbursementID
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
  const ReimbursementID = generateRequestId();
  await pool.request()
    .input('reimbursementReqID', sql.VarChar(30), ReimbursementID)
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
      (reimbursementReqID, EmpID, CompanyID, Attachment, Status, Type, Amount, Date, Description, approverEmpID)
      VALUES
      (@reimbursementReqID, @EmpID, @CompanyID, @Attachment, @Status, @Type, @Amount, @Date, @Description, @approverEmpID)
    `);
  return ReimbursementID;
}

// Delegate reimbursement approval to another approver
async function delegateReimbursementApproval(ReimbursementID, newApproverEmpID, comments) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('reimbursementReqID', sql.VarChar(30), ReimbursementID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE ReimbursementReqTable SET approverEmpID=@approverEmpID WHERE reimbursementReqID=@reimbursementReqID');

  // Log delegation in timeline
    const timelineID = generateTimelineID();
    await pool.request()
      .input('timelineID', sql.VarChar(30), timelineID)
      .input('reqID', sql.VarChar(30), ReimbursementID)
      .input('action', sql.VarChar(50), 'Delegated')
      .input('actorEmpID', sql.VarChar(30), newApproverEmpID)
      .input('comments', sql.VarChar(500), comments)
      .input('actionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
        VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
      `);
}

// Change approval/status (scoped by CompanyID)
async function changeReimbursementApproval(ReimbursementID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('reimbursementReqID', sql.VarChar(30), ReimbursementID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .input('Status', sql.VarChar(15), 'change request')
    .query('UPDATE ReimbursementReqTable SET Status=@Status WHERE reimbursementReqID=@reimbursementReqID AND companyID=@companyID');
}

// Pending details by ID (scoped by CompanyID)
async function getPendingReimbursementRequestDetails(reqID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('reimbursementReqID', sql.VarChar(30), reqID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM ReimbursementReqTable WHERE Status=\'Pending\' AND reimbursementReqID=@reimbursementReqID AND companyID=@companyID');
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
