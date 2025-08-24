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

/**
 * Get potential delegates: employees in the same company whose grade is equal to
 * the user's grade or one less than the user's grade.
 * Returns EmpID, Name, Position, Department, and Photo, ordered by Name ASC.
 * @param {string} EmpID
 * @param {string} CompanyID
 */
async function getDelegates(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Find the user's grade
  const gradeResult = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT Grade FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');

  const userGrade = gradeResult.recordset[0]?.Grade;
  if (userGrade === undefined || userGrade === null) {
    return [];
  }

  // Fetch employees with same grade or grade-1 in the same company
  const result = await pool.request()
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Grade', sql.Int, userGrade)
    .input('GradeMinusOne', sql.Int, userGrade - 1)
    .query(`
      SELECT p.EmpID AS empid, p.Name AS name, p.Position AS position, p.Department AS department, ph.photo AS photo
      FROM EmpProfileTable p
      LEFT JOIN EmpProfilePhotoTable ph
        ON ph.EmpID = p.EmpID AND ph.CompanyID = p.CompanyID
      WHERE p.CompanyID=@CompanyID AND p.Grade IN (@Grade, @GradeMinusOne)
      ORDER BY p.Name ASC
    `);

  return result.recordset;
}

module.exports = {
  getRequestTransactions,
  getRequestTimeline,
  getDelegates,
};
