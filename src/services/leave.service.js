const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Submit a leave (with or without attachment, which must be buffer)
async function applyLeave(data, attachmentBuffer = null,EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;

  const result = await pool.request()
    .input('LeaveReqID', sql.VarChar(30), data.LeaveReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('FromDate', sql.DateTime, data.FromDate)
    .input('ToDate', sql.DateTime, data.ToDate)
    .input('Type', sql.VarChar(10), data.Type)
    .input('Attachment', sql.VarBinary(sql.MAX), attachmentBuffer)
    .input('RequestDate', sql.Date, data.RequestDate || new Date())
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Description', sql.VarChar(500), data.Description)
    .query(`
      INSERT INTO LeaveReqTable (LeaveReqID, EmpID, FromDate, ToDate, Type, Attachment, RequestDate, Status, approverEmpID, Description)
      VALUES (@LeaveReqID, @EmpID, @FromDate, @ToDate, @Type, @Attachment, @RequestDate, @Status, @approverEmpID, @Description)
    `);
  return data.LeaveReqID;
}

// All leave history for an employee
async function getLeaveHistory(EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM LeaveReqTable WHERE EmpID = @EmpID AND CompanyID = @CompanyID ORDER BY RequestDate DESC');
  return res.recordset;
}

// Unique leave types in system (from requests)
async function getLeaveTypes() {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT DISTINCT Type FROM LeaveReqTable');
  return res.recordset.map(r => r.Type);
}

// Get leave request status
async function getLeaveStatus(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .query('SELECT Status FROM LeaveReqTable WHERE LeaveReqID = @LeaveReqID');
  return res.recordset[0];
}

// Cancel a leave (set status)
async function cancelLeave(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .query('UPDATE LeaveReqTable SET Status = \'Cancelled\' WHERE LeaveReqID = @LeaveReqID');
}

// Approve or reject leave
async function approveRejectLeave(LeaveReqID, action) {
  const pool = await sql.connect(dbConfig);
  const status = action === 'approve' ? 'Approved' : 'Rejected';
  await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .input('Status', sql.VarChar(15), status)
    .query('UPDATE LeaveReqTable SET Status=@Status WHERE LeaveReqID=@LeaveReqID');
}

// Pending leaves ("Pending" status) for employee
async function approveRejectLeaveRequest(EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM LeaveReqTable WHERE Status=\'Pending\' AND approverEmpID=@EmpID AND CompanyID=@CompanyID ORDER BY RequestDate DESC');
  return res.recordset;
}

// Get leave request by ID
async function getLeaveById(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .query('SELECT * FROM LeaveReqTable WHERE LeaveReqID=@LeaveReqID');
  return res.recordset[0];
}

// Update request (only editable fields)
async function updateLeave(LeaveReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .input('FromDate', sql.DateTime, updateData.FromDate)
    .input('ToDate', sql.DateTime, updateData.ToDate)
    .input('Type', sql.VarChar(10), updateData.Type)
    .input('Description', sql.VarChar(500), updateData.Description)
    .query(`
      UPDATE LeaveReqTable
        SET FromDate = @FromDate, ToDate = @ToDate, Type = @Type, Description = @Description
      WHERE LeaveReqID = @LeaveReqID
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
async function draftSaveLeaveRequest(data, attachmentBuffer = null,EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;

  await pool.request()
    .input('LeaveReqID', sql.VarChar(30), data.LeaveReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('FromDate', sql.DateTime, data.FromDate)
    .input('ToDate', sql.DateTime, data.ToDate)
    .input('Type', sql.VarChar(10), data.Type)
    .input('Attachment', sql.VarBinary(sql.MAX), attachmentBuffer)
    .input('RequestDate', sql.Date, data.RequestDate || new Date())
    .input('Status', sql.VarChar(15), 'Draft')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Description', sql.VarChar(500), data.Description)
    .query(`
      INSERT INTO LeaveReqTable (LeaveReqID, EmpID, FromDate, ToDate, Type, Attachment, RequestDate, Status, approverEmpID, Description)
      VALUES (@LeaveReqID, @EmpID, @FromDate, @ToDate, @Type, @Attachment, @RequestDate, @Status, @approverEmpID, @Description)
    `);
}

// Pending request details by ID
async function getPendingLeaveRequestDetails(LeaveReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .query('SELECT * FROM LeaveReqTable WHERE LeaveReqID=@LeaveReqID');
  return res.recordset[0];
}

// Change approval status
async function changeLeaveRequestApproval(LeaveReqID, newStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .input('Status', sql.VarChar(15), newStatus)
    .query('UPDATE LeaveReqTable SET Status=@Status WHERE LeaveReqID=@LeaveReqID');
}

// Delegate leave approval (assign to new approver)
async function delegateLeaveApproval(LeaveReqID, newApproverEmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('LeaveReqID', sql.VarChar(30), LeaveReqID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE LeaveReqTable SET approverEmpID=@approverEmpID WHERE LeaveReqID=@LeaveReqID');
  
  // Log delegation in timeline
    const timelineID = generateAttachmentID();
    await pool.request()
      .input('timelineID', sql.VarChar(30), timelineID)
      .input('reqID', sql.VarChar(30), LeaveReqID)
      .input('action', sql.VarChar(50), 'Delegated')
      .input('actorEmpID', sql.VarChar(30), actorEmpID)
      .input('comments', sql.VarChar(500), comments)
      .input('actionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO ReqTimelineTable
          (timelineID, reqID, action, actorEmpID, comments, actionDate)
        VALUES
          (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
      `);
}

module.exports = {
  applyLeave,
  getLeaveHistory,
  getLeaveTypes,
  getLeaveStatus,
  cancelLeave,
  approveRejectLeave,
  getLeaveById,
  updateLeave,
  getLeaveRequestDetails,
  editLeaveRequest,
  draftSaveLeaveRequest,
  getPendingLeaveRequestDetails,
  approveRejectLeaveRequest,
  changeLeaveRequestApproval,
  delegateLeaveApproval
};
