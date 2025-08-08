const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { randomBytes } = require('crypto');

// Helper to generate unique 8-char IDs for attachments
function generateAttachmentID() {
  return randomBytes(4).toString('hex');
}

// Get details for a specific business trip request for an employee
async function getBusinessTripRequestDetails(EmpID,CompanyID, ReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqID', sql.VarChar(30), ReqID)
    .query('SELECT * FROM BusinessTripReqTable WHERE empID = @EmpID AND companyID = @CompanyID AND reqID = @ReqID');
  return res.recordset[0];
}

// Get all business trip "transactions" for an employee - same as above (or can be filtered for approval/changes/other if workflow extended)
async function getBusinessTripTransactions(EmpID,CompanyID)   {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT reqID, location, status, createdDate FROM BusinessTripReqTable WHERE empID = @EmpID AND companyID = @CompanyID ORDER BY createdDate DESC');
  return res.recordset;
}

// Submit new business trip request
async function submitBusinessTripRequest(data, fileBuffer = null, fileName = null, fileType = null, fileSize = null,EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND companyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;

  // Handle attachment insertion
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

  // Insert business trip request with attachmentID
  await pool.request()
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Location', sql.VarChar(50), data.Location)
    .input('StartDate', sql.Date, data.StartDate)
    .input('EndDate', sql.Date, data.EndDate)
    .input('TravelMode', sql.VarChar(30), data.TravelMode)
    .input('reason', sql.VarChar(100), data.reason)
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('createdDate', sql.DateTime, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .query(`
      INSERT INTO BusinessTripReqTable
        (reqID, empID, companyID, location, startDate, endDate, travelMode, reason, attachmentID, approverEmpID, createdDate, status)
      VALUES
        (@ReqID, @EmpID, @CompanyID, @Location, @StartDate, @EndDate, @TravelMode, @reason, @attachmentID, @approverEmpID, @createdDate, @status)
    `);

  // Log creation in timeline
  const creationTimelineID = generateAttachmentID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), creationTimelineID)
    .input('reqID', sql.VarChar(30), data.ReqID)
    .input('action', sql.VarChar(50), 'Created')
    .input('actorEmpID', sql.VarChar(30), EmpID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);

  // Log pending in timeline
  const pendingTimelineID = generateAttachmentID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), pendingTimelineID)
    .input('reqID', sql.VarChar(30), data.ReqID)
    .input('action', sql.VarChar(50), 'Pending')
    .input('actorEmpID', sql.VarChar(30), managerID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);

}

// Submit on behalf of another employee
async function submitBusinessTripRequestOnBehalf(data, fileBuffer = null, fileName = null, fileType = null, fileSize = null, actorEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for target employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND companyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;

  // Handle attachment insertion
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

  // Insert business trip request
  await pool.request()
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Location', sql.VarChar(50), data.Location)
    .input('StartDate', sql.Date, data.StartDate)
    .input('EndDate', sql.Date, data.EndDate)
    .input('TravelMode', sql.VarChar(30), data.TravelMode)
    .input('reason', sql.VarChar(100), data.reason)
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('createdDate', sql.DateTime, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .query(`
      INSERT INTO BusinessTripReqTable
        (reqID, empID, companyID, location, startDate, endDate, travelMode, reason, attachmentID, approverEmpID, createdDate, status)
      VALUES
        (@ReqID, @EmpID, @CompanyID, @Location, @StartDate, @EndDate, @TravelMode, @reason, @attachmentID, @approverEmpID, @createdDate, @status)
    `);

  // Log creation in timeline
  const creationTimelineID = generateAttachmentID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), creationTimelineID)
    .input('reqID', sql.VarChar(30), data.ReqID)
    .input('action', sql.VarChar(50), 'Created')
    .input('actorEmpID', sql.VarChar(30), actorEmpID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);

  // Log pending in timeline
  const pendingTimelineID = generateAttachmentID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), pendingTimelineID)
    .input('reqID', sql.VarChar(30), data.ReqID)
    .input('action', sql.VarChar(50), 'Pending')
    .input('actorEmpID', sql.VarChar(30), managerID)
    .input('comments', sql.VarChar(500), null)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
}

// Edit existing request
async function editBusinessTripRequest(ReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('Location', sql.VarChar(50), updateData.Location)
    .input('StartDate', sql.Date, updateData.StartDate)
    .input('EndDate', sql.Date, updateData.EndDate)
    .input('TravelMode', sql.VarChar(30), updateData.TravelMode)
    .input('reason', sql.VarChar(100), updateData.reason)
    .query(`
      UPDATE BusinessTripReqTable
      SET Location = @Location, StartDate = @StartDate, EndDate = @EndDate,
          TravelMode = @TravelMode, reason = @reason
      WHERE ReqID = @ReqID
    `);
}

// Draft save: like submit, but status = 'Draft'
async function draftSaveBusinessTripRequest(data, fileBuffer = null, fileName = null, fileType = null, fileSize = null, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Handle attachment insertion
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
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Location', sql.VarChar(50), data.Location)
    .input('StartDate', sql.Date, data.StartDate)
    .input('EndDate', sql.Date, data.EndDate)
    .input('TravelMode', sql.VarChar(30), data.TravelMode)
    .input('reason', sql.VarChar(100), data.reason)
    .input('attachmentID', sql.VarChar(30), attachmentID)
    .input('createdDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Draft')
    .query(`
      INSERT INTO BusinessTripReqTable
        (reqID, empID, companyID, location, startDate, endDate, travelMode, reason, attachmentID, createdDate, status)
      VALUES
        (@ReqID, @EmpID, @CompanyID, @Location, @StartDate, @EndDate, @TravelMode, @reason, @attachmentID, @createdDate, @status)
    `);
}

// Change request
async function changeBusinessTripApproval(ReqID, newStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('status', sql.VarChar(20), newStatus)
    .query(`UPDATE BusinessTripReqTable SET status=@status WHERE reqID=@ReqID`);
}

// Approve or reject
async function approveRejectBusinessTripRequest(ReqID, action) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('status', sql.VarChar(20), action === 'approve' ? 'Approved' : 'Rejected')
    .query(`UPDATE BusinessTripReqTable SET status=@status WHERE reqID=@ReqID`);
}

// Get ALL pending requests for approval (status = 'Pending')
async function getPendingBusinessTripRequests(approverEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('approverEmpID', sql.VarChar(30), approverEmpID)
    .query(`SELECT reqID, location, createdDate FROM BusinessTripReqTable WHERE status='Pending' AND approverEmpID=@approverEmpID AND companyID=@CompanyID ORDER BY createdDate DESC`);
  return res.recordset;
}

// Get a pending business trip request by ReqID
async function getPendingBusinessTripRequestDetails(ReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .query('SELECT * FROM BusinessTripReqTable WHERE reqID=@ReqID');
  return res.recordset[0];
}

// Delegate a business trip request to another approver and log timeline
async function delegateBusinessTripRequest(reqID, newApproverEmpID, actorEmpID, comments = null) {
  const pool = await sql.connect(dbConfig);
  // Update approver
  await pool.request()
    .input('reqID', sql.VarChar(30), reqID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE BusinessTripReqTable SET approverEmpID=@approverEmpID WHERE reqID=@reqID');
  // Log delegation in timeline
  const timelineID = generateAttachmentID();
  await pool.request()
    .input('timelineID', sql.VarChar(30), timelineID)
    .input('reqID', sql.VarChar(30), reqID)
    .input('action', sql.VarChar(50), 'Delegated')
    .input('actorEmpID', sql.VarChar(30), actorEmpID)
    .input('comments', sql.VarChar(500), comments)
    .input('actionDate', sql.DateTime, new Date())
    .query(`
      INSERT INTO RequestTimelineTable
        (timelineID, reqID, action, actorEmpID, comments, actionDate)
      VALUES
        (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
    `);
}

module.exports = {
  getBusinessTripRequestDetails,
  getBusinessTripTransactions,
  submitBusinessTripRequest,
  submitBusinessTripRequestOnBehalf,
  editBusinessTripRequest,
  draftSaveBusinessTripRequest,
  changeBusinessTripApproval,
  approveRejectBusinessTripRequest,
  getPendingBusinessTripRequests,
  getPendingBusinessTripRequestDetails,
  delegateBusinessTripRequest,
};
