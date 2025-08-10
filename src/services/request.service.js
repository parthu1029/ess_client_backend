const sql = require('mssql');
const dbConfig = require('../config/db.config');

/**
 * Aggregate all request transactions from all request tables for an employee.
 * @param {string} empID
 * @returns {Promise<Array>} List of all requests (type, id, status, date, etc.)
 */
async function getRequestTransactions(empID, companyID) {
  const pool = await sql.connect(dbConfig);

  // Build transactions array by unioning data from all request tables
  const queries = [
    `
      SELECT 'Excuse' as RequestType, excuseReqID as RequestID, empID, status, submittedDate as RequestDate
      FROM ExcuseReqTable
      ${empID ? "WHERE empID=@empID AND CompanyID=@companyID" : ""}
    `,
    `
      SELECT 'Leave' as RequestType, reqID as RequestID, empID, status, requestDate as RequestDate
      FROM LeaveReqTable
      ${empID ? "WHERE empID=@empID AND CompanyID=@companyID" : ""}
    `,
    `
      SELECT 'BusinessTrip' as RequestType, reqID as RequestID, empID, status, createdDate as RequestDate
      FROM BusinessTripReqTable
      ${empID ? "WHERE empID=@empID AND CompanyID=@companyID" : ""}
    `,
    `
      SELECT 'FlightTicket' as RequestType, reqID as RequestID, empID, status, createdDate as RequestDate
      FROM FlightTicketReqTable
      ${empID ? "WHERE empID=@empID AND CompanyID=@companyID" : ""}
    `,
    `
      SELECT 'Document' as RequestType, documentReqID as RequestID, empID, status, reqDate as RequestDate
      FROM DocumentReqTable
      ${empID ? "WHERE empID=@empID AND CompanyID=@companyID" : ""}
    `,
    `
      SELECT 'Reimbursement' as RequestType, reimbursementReqID as RequestID, empID, status, reqSubmittedDate as RequestDate
      FROM ReimbursementReqTable
      ${empID ? "WHERE empID=@empID AND CompanyID=@companyID" : ""}
    `,
  ];

  // Join the queries with UNION ALL
  const unionQuery = queries.join('\nUNION ALL\n');
  const request = pool.request();
  if (empID) request.input('empID', sql.VarChar(30), empID);
  if (companyID) request.input('companyID', sql.VarChar(30), companyID);

  const result = await request.query(unionQuery + ' ORDER BY RequestDate DESC');
  return result.recordset;
}

async function getRequestTimeline(reqID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('reqID', sql.VarChar(30), reqID)
    .query('SELECT * FROM RequestTimelineTable WHERE reqID = @reqID ORDER BY actionDate DESC');
  return result.recordset;
}

module.exports = {
  getRequestTransactions,
  getRequestTimeline,
};
