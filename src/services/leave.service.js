const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { randomBytes } = require('crypto');
const { generateRequestId, generateAttachmentID } = require('../utils/ids');

function generateTimelineID() {
  return randomBytes(4).toString('hex');
}

// Submit a leave (with or without attachment, which must be buffer)
async function applyLeave(data, attachmentBuffer = null, EmpID, CompanyID,fileName,fileType,fileSize) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;

  // Generate server-side LeaveReqID
  const leaveReqID = generateRequestId();

  let attachmentID = null;
    if (attachmentBuffer) {
      attachmentID = generateAttachmentID();
      await pool.request()
        .input('attachmentID', sql.VarChar(30), attachmentID)
        .input('fileName', sql.VarChar(255), fileName)
        .input('fileType', sql.VarChar(100), fileType)
        .input('fileSize', sql.Int, fileSize)
        .input('content', sql.VarBinary(sql.MAX), attachmentBuffer)
        .input('uploadedDate', sql.DateTime, new Date())
        .query(`
          INSERT INTO AttachmentsTable (attachmentID, fileName, fileType, fileSize, content, uploadedDate)
          VALUES (@attachmentID, @fileName, @fileType, @fileSize, @content, @uploadedDate)
        `);
    }

  const result = await pool.request()
    .input('reqID', sql.VarChar(30), leaveReqID)
    .input('empID', sql.VarChar(30), EmpID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .input('fromDate', sql.DateTime, data.FromDate)
    .input('toDate', sql.DateTime, data.ToDate)
    .input('type', sql.VarChar(10), data.Type)
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('requestDate', sql.Date, new Date())
    .input('status', sql.VarChar(15), 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('description', sql.VarChar(500), data.Description)
    .query(`
      INSERT INTO LeaveReqTable (reqID, empID, companyID, fromDate, toDate, type, attachmentID, requestDate, status, approverEmpID, description)
      VALUES (@reqID, @empID, @companyID, @fromDate, @toDate, @type, @attachmentID, @requestDate, @status, @approverEmpID, @description)
    `);

    // Log request in timeline
    const timelineID = generateTimelineID();
    await pool.request()
      .input('timelineID', sql.VarChar(30), timelineID)
      .input('reqID', sql.VarChar(30), leaveReqID)
      .input('action', sql.VarChar(50), 'Applied')
      .input('actorEmpID', sql.VarChar(30), EmpID)
      .input('comments', sql.VarChar(500), null)
      .input('actionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
        VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
      `);
    
      // Log request in timeline
    const timelineID_1 = generateTimelineID();
    await pool.request()
      .input('timelineID', sql.VarChar(30), timelineID_1)
      .input('reqID', sql.VarChar(30), leaveReqID)
      .input('action', sql.VarChar(50), 'Pending')
      .input('actorEmpID', sql.VarChar(30), managerID)
      .input('comments', sql.VarChar(500),null)
      .input('actionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
        VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
      `);

  return leaveReqID;
}

// All leave history for an employee
async function getLeaveHistory(EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM LeaveReqTable WHERE empID = @EmpID AND companyID = @CompanyID ORDER BY requestDate DESC');
  return res.recordset;
}

// Unique leave types in system (from requests)
async function getLeaveTypes() {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT DISTINCT type FROM LeaveReqTable');
  return res.recordset.map(r => r.type);
}


// Cancel a leave (set status)
async function cancelLeave(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .query('UPDATE LeaveReqTable SET status = \'Cancelled\' WHERE reqID = @reqID');
}

// Approve or reject leave
async function approveRejectLeave(LeaveReqID, action) {
  const pool = await sql.connect(dbConfig);
  const status = action === 'approve' ? 'Approved' : 'Rejected';
  await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .input('status', sql.VarChar(15), status)
    .query('UPDATE LeaveReqTable SET status=@status WHERE reqID=@reqID');
}

// Pending leaves ("Pending" status) for employee
async function getPendingLeaves(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM LeaveReqTable WHERE status=\'Pending\' AND approverEmpID=@EmpID AND companyID=@CompanyID ORDER BY requestDate DESC');
  return res.recordset;
}


// Get leave request by ID
async function getLeaveById(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .query('SELECT * FROM LeaveReqTable WHERE reqID=@reqID');
  return res.recordset[0];
}

// Update request (only editable fields)
async function updateLeave(LeaveReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .input('fromDate', sql.DateTime, updateData.FromDate)
    .input('toDate', sql.DateTime, updateData.ToDate)
    .input('type', sql.VarChar(10), updateData.Type)
    .input('description', sql.VarChar(500), updateData.Description)
    .query(`
      UPDATE LeaveReqTable
        SET fromDate = @fromDate, toDate = @toDate, type = @type, description = @description
      WHERE reqID = @reqID
    `);
}

// All requests for an employee
async function getLeaveRequestDetails(EmpID ,CompanyID) {
  return getLeaveHistory(EmpID,CompanyID);
}

// Edit (patch) a request (same as update)
async function editLeaveRequest(LeaveReqID, updateData) {
  return updateLeave(LeaveReqID, updateData);
}

// Save as draft
async function draftSaveLeaveRequest(data, attachmentBuffer = null, EmpID, CompanyID, fileName, fileType, fileSize) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;

  // Generate server-side LeaveReqID for draft
  const leaveReqIDDraft = generateRequestId();

  let attachmentID = null;
  if (attachmentBuffer) {
    attachmentID = generateAttachmentID();
    await pool.request()
      .input('attachmentID', sql.VarChar(30), attachmentID)
      .input('fileName', sql.VarChar(255), fileName)
      .input('fileType', sql.VarChar(100), fileType)
      .input('fileSize', sql.Int, fileSize)
      .input('content', sql.VarBinary(sql.MAX), attachmentBuffer)
      .input('uploadedDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO AttachmentsTable (attachmentID, fileName, fileType, fileSize, content, uploadedDate)
        VALUES (@attachmentID, @fileName, @fileType, @fileSize, @content, @uploadedDate)
      `);
  }

  await pool.request()
    .input('reqID', sql.VarChar(30), leaveReqIDDraft)
    .input('empID', sql.VarChar(30), EmpID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .input('fromDate', sql.DateTime, data.FromDate)
    .input('toDate', sql.DateTime, data.ToDate)
    .input('type', sql.VarChar(10), data.Type)
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('requestDate', sql.Date, data.RequestDate || new Date())
    .input('status', sql.VarChar(15), 'Draft')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('description', sql.VarChar(500), data.Description)
    .query(`
      INSERT INTO LeaveReqTable (reqID, empID, companyID, fromDate, toDate, type, attachmentID, requestDate, status, approverEmpID, description)
      VALUES (@reqID, @empID, @companyID, @fromDate, @toDate, @type, @attachmentID, @requestDate, @status, @approverEmpID, @description)
    `);
  return leaveReqIDDraft;
}

// Pending request details by ID
async function getPendingLeaveRequestDetails(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .query('SELECT * FROM LeaveReqTable WHERE reqID=@reqID');
  return res.recordset[0];
}

// Change approval status
async function changeLeaveRequestApproval(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .input('status', sql.VarChar(15), 'Change request')
    .query('UPDATE LeaveReqTable SET status=@status WHERE reqID=@reqID');
}

// Delegate leave approval (assign to new approver)
async function delegateLeaveApproval(LeaveReqID, newApproverEmpID, comments = null) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE LeaveReqTable SET approverEmpID=@approverEmpID WHERE reqID=@reqID');

  // Log delegation in timeline
  const timelineID = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), timelineID)
    .input('reqID', sql.VarChar(30), LeaveReqID)
    .input('action', sql.VarChar(50), 'Delegated')
    .input('actorEmpID', sql.VarChar(30), newApproverEmpID)
    .input('comments', sql.VarChar(500), comments)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
}

module.exports = {
  applyLeave,
  getLeaveHistory,
  getLeaveTypes,
  cancelLeave,
  approveRejectLeave,
  getLeaveById,
  updateLeave,
  getLeaveRequestDetails,
  editLeaveRequest,
  draftSaveLeaveRequest,
  getPendingLeaveRequestDetails,
  changeLeaveRequestApproval,
  delegateLeaveApproval,
  getPendingLeaves
};
