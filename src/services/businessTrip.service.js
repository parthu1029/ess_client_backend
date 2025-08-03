const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get all business trip requests for an employee
async function getBusinessTripRequestDetails(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM BusinessTripReqTable WHERE EmpID = @EmpID ORDER BY createdDate DESC');
  return res.recordset;
}

// Get all business trip "transactions" for an employee - same as above (or can be filtered for approval/changes/other if workflow extended)
async function getBusinessTripTransactions(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM BusinessTripReqTable WHERE EmpID = @EmpID ORDER BY createdDate DESC');
  return res.recordset;
}

// Submit new business trip request
async function submitBusinessTripRequest(data, fileBuffer = null) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('Location', sql.VarChar(50), data.Location)
    .input('StartDate', sql.Date, data.StartDate)
    .input('EndDate', sql.Date, data.EndDate)
    .input('TravelMode', sql.VarChar(30), data.TravelMode)
    .input('reason', sql.VarChar(100), data.reason)
    .input('attachment', sql.VarBinary(sql.MAX), fileBuffer) // Can be null
    .input('createdDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .query(`
      INSERT INTO BusinessTripReqTable
        (ReqID, EmpID, Location, StartDate, EndDate, TravelMode, reason, attachment, createdDate, status)
      VALUES
        (@ReqID, @EmpID, @Location, @StartDate, @EndDate, @TravelMode, @reason, @attachment, @createdDate, @status)
    `);
}

// Submit on behalf (just the EmpID/ReqID is different)
async function submitBusinessTripRequestOnBehalf(data, fileBuffer = null) {
  return submitBusinessTripRequest(data, fileBuffer);
}

// Edit existing request
async function editBusinessTripRequest(ReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  // Only update fields that are provided - example for main editable fields
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
async function draftSaveBusinessTripRequest(data, fileBuffer = null) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('Location', sql.VarChar(50), data.Location)
    .input('StartDate', sql.Date, data.StartDate)
    .input('EndDate', sql.Date, data.EndDate)
    .input('TravelMode', sql.VarChar(30), data.TravelMode)
    .input('reason', sql.VarChar(100), data.reason)
    .input('attachment', sql.VarBinary(sql.MAX), fileBuffer)
    .input('createdDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Draft')
    .query(`
      INSERT INTO BusinessTripReqTable
        (ReqID, EmpID, Location, StartDate, EndDate, TravelMode, reason, attachment, createdDate, status)
      VALUES
        (@ReqID, @EmpID, @Location, @StartDate, @EndDate, @TravelMode, @reason, @attachment, @createdDate, @status)
    `);
}

// Delegate approval (not present as column in ERD; skipped unless you add ApproverEmpID)
// You cannot actually change approver in ERD columns.

// Change approval status (pending/approved/rejected etc.)
async function changeBusinessTripApproval(ReqID, newStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('status', sql.VarChar(20), newStatus)
    .query(`UPDATE BusinessTripReqTable SET status=@status WHERE ReqID=@ReqID`);
}

// Approve or reject: just a special case of status update
async function approveRejectBusinessTripRequest(ReqID, action) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('status', sql.VarChar(20), action === 'approve' ? 'Approved' : 'Rejected')
    .query(`UPDATE BusinessTripReqTable SET status=@status WHERE ReqID=@ReqID`);
}

// Get ALL pending requests for approval (status = 'Pending')
async function getPendingBusinessTripRequests(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query(`SELECT * FROM BusinessTripReqTable WHERE status='Pending' AND EmpID=@EmpID ORDER BY createdDate DESC`);
  return res.recordset;
}

// Get a pending business trip request by ReqID
async function getPendingBusinessTripRequestDetails(ReqID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .query('SELECT * FROM BusinessTripReqTable WHERE ReqID=@ReqID');
  return res.recordset[0];
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
};
