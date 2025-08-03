const sql = require('mssql');
const dbConfig = require('../config/db.config');

/**
 * Aggregate all request transactions from all request tables for an employee.
 * @param {string} EmpID
 * @returns {Promise<Array>} List of all requests (type, id, status, date, etc.)
 */
async function getRequestTransactions(EmpID) {
  const pool = await sql.connect(dbConfig);

  // Build transactions array by unioning data from all request tables
  const queries = [
    `
      SELECT 'Excuse' as RequestType, ExcuseReqID as RequestID, EmpID, Status, ReqSubmittedDate as RequestDate
      FROM ExcuseReqTable
      ${EmpID ? "WHERE EmpID=@EmpID" : ""}
    `,
    `
      SELECT 'Leave' as RequestType, LeaveReqID as RequestID, EmpID, Status, RequestDate
      FROM LeaveReqTable
      ${EmpID ? "WHERE EmpID=@EmpID" : ""}
    `,
    `
      SELECT 'BusinessTrip' as RequestType, ReqID as RequestID, EmpID, status as Status, createdDate as RequestDate
      FROM BusinessTripReqTable
      ${EmpID ? "WHERE EmpID=@EmpID" : ""}
    `,
    `
      SELECT 'FlightTicket' as RequestType, ReqID as RequestID, EmpID, status as Status, CreatedDate as RequestDate
      FROM FlightTicketReqTable
      ${EmpID ? "WHERE EmpID=@EmpID" : ""}
    `,
    `
      SELECT 'Document' as RequestType, DocumentReqID as RequestID, EmpID, Status, ReqDate as RequestDate
      FROM DocumentReqTable
      ${EmpID ? "WHERE EmpID=@EmpID" : ""}
    `,
    `
      SELECT 'Reimbursement' as RequestType, ReimbursementID as RequestID, EmpID, Status, Date as RequestDate
      FROM ReimbursementReqTable
      ${EmpID ? "WHERE EmpID=@EmpID" : ""}
    `,
  ];

  // Join the queries with UNION ALL
  const unionQuery = queries.join('\nUNION ALL\n');
  const request = pool.request();
  if (EmpID) request.input('EmpID', sql.VarChar(30), EmpID);

  const result = await request.query(unionQuery + ' ORDER BY RequestDate DESC');
  return result.recordset;
}

module.exports = {
  getRequestTransactions,
};
