const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { generateRequestId } = require('../utils/ids');

// Get flight ticket request details by request ID (scoped by CompanyID)
async function getFlightTicketRequestDetails(ReqID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE ReqID = @ReqID AND CompanyID = @CompanyID');
  return result.recordset[0];
}

// Get all transactions/history for an employee
async function getFlightTicketTransactions(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  // Assume each request update counts as a transaction; otherwise, join to a separate log table if exists
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE EmpID = @EmpID AND CompanyID = @CompanyID ORDER BY CreatedDate DESC');
  return result.recordset;
}

// Submit a new flight ticket request
async function submitFlightTicketRequest(data, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;
  const ReqID = generateRequestId();
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('DepartingDate', sql.VarChar(50), data.DepartingDate)
    .input('From', sql.VarChar(50), data.From)
    .input('To', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), data.ReturnDate)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .input('ApproverEmpID', sql.VarChar(30), managerID)
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, CompanyID, ReqID, DepartingDate, [From], [To], Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, ApproverEmpID, status)
      VALUES
      (@EmpID, @CompanyID, @ReqID, @DepartingDate, @From, @To, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @ApproverEmpID, @status)
    `);
  return ReqID;
}

// Submit a flight ticket request on behalf of another employee
async function submitFlightTicketRequestOnBehalf(data, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;
  const ReqID = generateRequestId();
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('DepartingDate', sql.VarChar(50), data.DepartingDate)
    .input('From', sql.VarChar(50), data.From)
    .input('To', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), data.ReturnDate)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .input('ApproverEmpID', sql.VarChar(30), managerID)
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, CompanyID, ReqID, DepartingDate, [From], [To], Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, ApproverEmpID, status)
      VALUES
      (@EmpID, @CompanyID, @ReqID, @DepartingDate, @From, @To, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @ApproverEmpID, @status)
    `);
  return ReqID;
}

// Patch/edit an existing request (fields as needed)
async function editFlightTicketRequest(requestId, updateData, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('DepartingDate', sql.VarChar(50), updateData.DepartingDate)
    .input('From', sql.VarChar(50), updateData.From)
    .input('To', sql.VarChar(50), updateData.To)
    .input('Purpose', sql.VarChar(100), updateData.Purpose)
    .input('Class', sql.VarChar(10), updateData.Class)
    .input('ReturnTrip', sql.Bit, updateData.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), updateData.ReturnDate)
    .input('status', sql.VarChar(20), updateData.status)
    .query(`
      UPDATE FlightTicketReqTable
      SET DepartingDate=@DepartingDate, [From]=@From, [To]=@To, Purpose=@Purpose,
          Class=@Class, ReturnTrip=@ReturnTrip, ReturnDate=@ReturnDate, status=@status
      WHERE ReqID=@ReqID AND CompanyID=@CompanyID
    `);
}

// Save as draft
async function draftSaveFlightTicketRequest(data, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;
  const ReqID = generateRequestId();
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('DepartingDate', sql.VarChar(50), data.DepartingDate)
    .input('From', sql.VarChar(50), data.From)
    .input('To', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), data.ReturnDate)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Draft')
    .input('ApproverEmpID', sql.VarChar(30), managerID)
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, CompanyID, ReqID, DepartingDate, [From], [To], Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, ApproverEmpID, status)
      VALUES
      (@EmpID, @CompanyID, @ReqID, @DepartingDate, @From, @To, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @ApproverEmpID, @status)
    `);
  return ReqID;
}

// Delegate approval to another emp
async function delegateFlightTicketApproval(requestId, newApproverEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ApproverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE FlightTicketReqTable SET ApproverEmpID=@ApproverEmpID WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
}

// Change approval status of a flight ticket request
async function changeFlightTicketApproval(requestId, approvalStatus, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('status', sql.VarChar(20), approvalStatus)
    .query('UPDATE FlightTicketReqTable SET status=@status WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
}

// Approve or reject ticket
async function approveRejectFlightTicketRequest(requestId, action, comments, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('status', sql.VarChar(20), action === 'approve' ? 'Approved' : 'Rejected')
    .input('ApproverComments', sql.VarChar(100), comments)
    .input('ReviewedAt', sql.Date, new Date())
    .query('UPDATE FlightTicketReqTable SET status=@status, ApproverComments=@ApproverComments, ReviewedAt=@ReviewedAt WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
}

// Get pending requests for a given approver
async function getPendingFlightTicketRequests(ApproverEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ApproverEmpID', sql.VarChar(30), ApproverEmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE status = \'Pending\' AND ApproverEmpID = @ApproverEmpID AND CompanyID=@CompanyID ORDER BY CreatedDate DESC');
  return result.recordset;
}

// Get details of a pending request
async function getPendingFlightTicketRequestsDetails(requestId, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

module.exports = {
  getFlightTicketRequestDetails,
  getFlightTicketTransactions,
  submitFlightTicketRequest,
  submitFlightTicketRequestOnBehalf,
  editFlightTicketRequest,
  draftSaveFlightTicketRequest,
  delegateFlightTicketApproval,
  changeFlightTicketApproval,
  approveRejectFlightTicketRequest,
  getPendingFlightTicketRequests,
  getPendingFlightTicketRequestsDetails,
};
