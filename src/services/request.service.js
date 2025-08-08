const sql = require('mssql');
const dbConfig = require('../config/db.config');

/**
 * Aggregate all request transactions from all request tables for an employee.
 * @param {string} EmpID
 * @returns {Promise<Array>} List of all requests (type, id, status, date, etc.)
 */
async function getRequestTransactions(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Build transactions array by unioning data from all request tables
  const queries = [
    `
      SELECT 'Excuse' as RequestType, ExcuseReqID as RequestID, EmpID, Status, ReqSubmittedDate as RequestDate
      FROM ExcuseReqTable
      ${EmpID ? "WHERE EmpID=@EmpID AND CompanyID=@CompanyID" : ""}
    `,
    `
      SELECT 'Leave' as RequestType, LeaveReqID as RequestID, EmpID, Status, RequestDate
      FROM LeaveReqTable
      ${EmpID ? "WHERE EmpID=@EmpID AND CompanyID=@CompanyID" : ""}
    `,
    `
      SELECT 'BusinessTrip' as RequestType, ReqID as RequestID, EmpID, status as Status, createdDate as RequestDate
      FROM BusinessTripReqTable
      ${EmpID ? "WHERE EmpID=@EmpID AND CompanyID=@CompanyID" : ""}
    `,
    `
      SELECT 'FlightTicket' as RequestType, ReqID as RequestID, EmpID, status as Status, CreatedDate as RequestDate
      FROM FlightTicketReqTable
      ${EmpID ? "WHERE EmpID=@EmpID AND CompanyID=@CompanyID" : ""}
    `,
    `
      SELECT 'Document' as RequestType, DocumentReqID as RequestID, EmpID, Status, ReqDate as RequestDate
      FROM DocumentReqTable
      ${EmpID ? "WHERE EmpID=@EmpID AND CompanyID=@CompanyID" : ""}
    `,
    `
      SELECT 'Reimbursement' as RequestType, ReimbursementID as RequestID, EmpID, Status, Date as RequestDate
      FROM ReimbursementReqTable
      ${EmpID ? "WHERE EmpID=@EmpID AND CompanyID=@CompanyID" : ""}
    `,
  ];

  // Join the queries with UNION ALL
  const unionQuery = queries.join('\nUNION ALL\n');
  const request = pool.request();
  if (EmpID) request.input('EmpID', sql.VarChar(30), EmpID);
  if (CompanyID) request.input('CompanyID', sql.VarChar(30), CompanyID);

  const result = await request.query(unionQuery + ' ORDER BY RequestDate DESC');
  return result.recordset;
}

async function getRequestTimeline(reqID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ReqID', sql.VarChar(30), reqID)
    .query('SELECT * FROM RequestTimelineTable WHERE reqID = @ReqID ORDER BY actionDate DESC');
  return result.recordset;
}

module.exports = {
  getRequestTransactions,
  getRequestTimeline,
};
