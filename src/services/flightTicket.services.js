const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get all flight ticket requests for an employee
async function getFlightTicketRequestDetails(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM FlightTicketReqTable WHERE EmpID = @EmpID ORDER BY CreatedDate DESC');
  return result.recordset;
}

// Get all transactions/history for an employee
async function getFlightTicketTransactions(EmpID) {
  const pool = await sql.connect(dbConfig);
  // Assume each request update counts as a transaction; otherwise, join to a separate log table if exists
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM FlightTicketReqTable WHERE EmpID = @EmpID ORDER BY CreatedDate DESC');
  return result.recordset;
}

// Submit a new flight ticket request
async function submitFlightTicketRequest(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('DepartingDate', sql.VarChar(50), data.DepartingDate)
    .input('From', sql.VarChar(50), data.From)
    .input('To', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), data.ReturnDate)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, ReqID, DepartingDate, [From], [To], Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, status)
      VALUES
      (@EmpID, @ReqID, @DepartingDate, @From, @To, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @status)
    `);
}

// Submit a flight ticket request on behalf of another employee
async function submitFlightTicketRequestOnBehalf(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('DepartingDate', sql.VarChar(50), data.DepartingDate)
    .input('From', sql.VarChar(50), data.From)
    .input('To', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), data.ReturnDate)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, ReqID, DepartingDate, [From], [To], Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, status)
      VALUES
      (@EmpID, @ReqID, @DepartingDate, @From, @To, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @status)
    `);
}

// Patch/edit an existing request (fields as needed)
async function editFlightTicketRequest(requestId, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
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
      WHERE ReqID=@ReqID
    `);
}

// Save as draft
async function draftSaveFlightTicketRequest(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('ReqID', sql.VarChar(30), data.ReqID)
    .input('DepartingDate', sql.VarChar(50), data.DepartingDate)
    .input('From', sql.VarChar(50), data.From)
    .input('To', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), data.ReturnDate)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Draft')
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, ReqID, DepartingDate, [From], [To], Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, status)
      VALUES
      (@EmpID, @ReqID, @DepartingDate, @From, @To, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @status)
    `);
}

// Delegate approval to another emp
async function delegateFlightTicketApproval(requestId, newApproverEmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('ApproverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE FlightTicketReqTable SET ApproverEmpID=@ApproverEmpID WHERE ReqID=@ReqID');
}

// Change approval status of a flight ticket request
async function changeFlightTicketApproval(requestId, approvalStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('status', sql.VarChar(20), approvalStatus)
    .query('UPDATE FlightTicketReqTable SET status=@status WHERE ReqID=@ReqID');
}

// Approve or reject ticket
async function approveRejectFlightTicketRequest(requestId, action, comments) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('status', sql.VarChar(20), action === 'approve' ? 'Approved' : 'Rejected')
    .input('ApproverComments', sql.VarChar(100), comments)
    .input('ReviewedAt', sql.Date, new Date())
    .query('UPDATE FlightTicketReqTable SET status=@status, ApproverComments=@ApproverComments, ReviewedAt=@ReviewedAt WHERE ReqID=@ReqID');
}

// Get pending requests for a given approver
async function getPendingFlightTicketRequests(ApproverEmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ApproverEmpID', sql.VarChar(30), ApproverEmpID)
    .query('SELECT * FROM FlightTicketReqTable WHERE status = \'Pending\' AND ApproverEmpID = @ApproverEmpID ORDER BY CreatedDate DESC');
  return result.recordset;
}

// Get details of a pending request
async function getPendingFlightTicketRequestsDetails(requestId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .query('SELECT * FROM FlightTicketReqTable WHERE ReqID=@ReqID');
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
