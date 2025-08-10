const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { randomBytes } = require('crypto');
const { generateRequestId, generateAttachmentID } = require('../utils/ids');

function generateTimelineID() {
  return randomBytes(4).toString('hex');
}

function formatToSQLTime(timeInput) {
  if (timeInput instanceof Date) {
    const h = String(timeInput.getHours()).padStart(2, '0');
    const m = String(timeInput.getMinutes()).padStart(2, '0');
    const s = String(timeInput.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  if (timeInput == null) return null;
  const raw = String(timeInput).trim();
  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  let h, m, s;
  if (ampmMatch) {
    h = parseInt(ampmMatch[1], 10);
    m = parseInt(ampmMatch[2], 10);
    s = parseInt(ampmMatch[3] || '0', 10);
    const ampm = ampmMatch[4].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
  } else {
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;
    h = parseInt(match[1], 10);
    m = parseInt(match[2], 10);
    s = parseInt(match[3] || '0', 10);
  }
  if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(s)) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Submit new excuse with optional attachment
async function submitExcuseRequest(data, attachmentBuffer = null, EmpID, CompanyID, fileName, fileType, fileSize) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;

  const ExcuseReqID = generateRequestId();

  // Optional: persist attachment as blob in AttachmentsTable and reference by ID
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
    .input('ExcuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('fromTime', sql.Time, formatToSQLTime(data.From))
    .input('toTime', sql.Time, formatToSQLTime(data.To))
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('submittedDate', sql.Date, new Date())
    .input('status', sql.VarChar(15), 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('excuseDate', sql.Date, data.Date)
    .input('reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO ExcuseReqTable
      (excuseReqID, empID, companyID, fromTime, toTime, attachmentID, submittedDate, status, approverEmpID, excuseDate, reason)
      VALUES 
      (@excuseReqID, @empID, @companyID, @fromTime, @toTime, @attachmentID, @submittedDate, @status, @approverEmpID, @excuseDate, @reason)
    `);

  // Log submission in timeline
  const timelineID = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), timelineID)
    .input('reqID', sql.VarChar(30), ExcuseReqID)
    .input('action', sql.VarChar(50), 'Submitted')
    .input('actorEmpID', sql.VarChar(30), EmpID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable
        (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES
        (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
  
  // Log pending in timeline
  const timelineID_1 = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), timelineID_1)
    .input('reqID', sql.VarChar(30), ExcuseReqID)
    .input('action', sql.VarChar(50), 'Pending')
    .input('actorEmpID', sql.VarChar(30), managerID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable
        (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES
        (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
  
  return ExcuseReqID;
}

// Get excuse transactions (history) for an employee
async function getExcuseTransactions(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('empID', sql.VarChar(30), EmpID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM ExcuseReqTable WHERE empID = @empID AND companyID = @companyID ORDER BY submittedDate DESC');
  return res.recordset;
}

// Approve or reject an excuse
async function approveRejectExcuse(ExcuseReqID, action, comments) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
    .query(`UPDATE ExcuseReqTable SET status=@status WHERE excuseReqID=@excuseReqID`);
}

// Cancel excuse by setting status to 'Cancelled'
async function cancelExcuse(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .query(`UPDATE ExcuseReqTable SET status='Cancelled' WHERE excuseReqID=@excuseReqID`);
}

// Get excuse by ID (metadata & attachment)
async function getExcuseRequestDetails(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE excuseReqID = @excuseReqID');
  return res.recordset[0];
}

// Edit (patch) excuse request
async function editExcuseRequest(ExcuseReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('fromTime', sql.Time, formatToSQLTime(updateData.From))
    .input('toTime', sql.Time, formatToSQLTime(updateData.To))
    .input('reason', sql.VarChar(100), updateData.Reason)
    .query(`UPDATE ExcuseReqTable SET fromTime=@fromTime, toTime=@toTime, reason=@reason WHERE excuseReqID=@excuseReqID`);
}

// Save as draft
async function draftSaveExcuseRequest(data, attachmentBuffer = null, EmpID, CompanyID, fileName, fileType, fileSize) {
  const pool = await sql.connect(dbConfig);
  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;

  const ExcuseReqID = generateRequestId();

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
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('empID', sql.VarChar(30), EmpID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .input('fromTime', sql.Time, formatToSQLTime(data.From))
    .input('toTime', sql.Time, formatToSQLTime(data.To))
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('submittedDate', sql.Date, data.ReqSubmittedDate || new Date())
    .input('status', sql.VarChar(15), 'Draft')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('excuseDate', sql.Date, data.Date)
    .input('reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO ExcuseReqTable
      (excuseReqID, empID, companyID, fromTime, toTime, attachmentID, submittedDate, status, approverEmpID, excuseDate, reason)
      VALUES 
      (@excuseReqID, @empID, @companyID, @fromTime, @toTime, @attachmentID, @submittedDate, @status, @approverEmpID, @excuseDate, @reason)
    `);

  return ExcuseReqID;
}

// Get all pending excuse requests for an employee
async function getPendingExcuseRequests(EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('empID', sql.VarChar(30), EmpID)
    .input('companyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM ExcuseReqTable WHERE status = \'Pending\' AND approverEmpID = @empID AND companyID = @companyID ORDER BY submittedDate DESC');
  return res.recordset;
}

// Get details for a pending excuse request
async function getPendingExcuseRequestDetails(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE excuseReqID=@excuseReqID');
  return res.recordset[0];
}

// Change excuse approval (status)
async function changeExcuseApproval(ExcuseReqID, approvalStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('status', sql.VarChar(15), approvalStatus)
    .query('UPDATE ExcuseReqTable SET status=@status WHERE excuseReqID=@excuseReqID');
}

// Delegate excuse approval (assign to new approver)
async function delegateExcuseApproval(ExcuseReqID, newApproverEmpID, comments) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE ExcuseReqTable SET approverEmpID=@approverEmpID WHERE excuseReqID=@excuseReqID');

  // Log delegation in timeline
  const timelineID = generateTimelineID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), timelineID)
    .input('reqID', sql.VarChar(30), ExcuseReqID)
    .input('action', sql.VarChar(50), 'Delegated')
    .input('actorEmpID', sql.VarChar(30), newApproverEmpID)
    .input('comments', sql.VarChar(500), comments)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable
        (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES
        (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
}

// Submit excuse on behalf of another employee
async function submitExcuseOnBehalf(data, attachmentBuffer, EmpID, CompanyID, fileName, fileType, fileSize) {
  return await submitExcuseRequest(data, attachmentBuffer, EmpID, CompanyID, fileName, fileType, fileSize);
}

// (removed duplicate getExcuseTransactions definition)

// Get full details for a specific excuse request
async function getExcuseRequestDetails(ExcuseReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('excuseReqID', sql.VarChar(30), ExcuseReqID)
    .query('SELECT * FROM ExcuseReqTable WHERE excuseReqID = @excuseReqID');
  return res.recordset[0];
}

// Get distinct excuse types
async function getExcuseTypes() {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT DISTINCT reason FROM ExcuseReqTable');
  return res.recordset.map(r => r.reason);
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
