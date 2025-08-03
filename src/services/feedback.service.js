const sql = require('mssql');
const dbConfig = require('../config/db.config');

/**
 * Submit new feedback entry.
 * @param {Object} data - Feedback data
 */
async function submitFeedback(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('FromEmpID', sql.VarChar(30), data.fromEmpID)
    .input('ToEmpID', sql.VarChar(30), data.toEmpID)
    .input('TypeID', sql.Int, data.typeID)
    .input('Comments', sql.NVarChar(sql.MAX), data.comments)
    .input('CreatedAt', sql.DateTime, new Date())
    .input('Status', sql.VarChar(20), 'New') // Default status is 'New'
    .query(`
      INSERT INTO FeedbackTable (FromEmpID, ToEmpID, TypeID, Comments, CreatedAt, Status)
      VALUES (@FromEmpID, @ToEmpID, @TypeID, @Comments, @CreatedAt, @Status)
    `);
}

/**
 * Get feedback history submitted by or received by employee.
 * @param {string} empId - Employee ID
 * @returns {Promise<Array>}
 */
async function getFeedbackHistory(empId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), empId)
    .query(`
      SELECT * FROM FeedbackTable 
      WHERE FromEmpID = @EmpID OR ToEmpID = @EmpID 
      ORDER BY CreatedAt DESC
    `);
  return result.recordset;
}

/**
 * Get feedback received by employee.
 * @param {string} empId - Employee ID
 * @returns {Promise<Array>}
 */
async function getReceivedFeedback(empId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), empId)
    .query(`
      SELECT * FROM FeedbackTable 
      WHERE ToEmpID = @EmpID 
      ORDER BY CreatedAt DESC
    `);
  return result.recordset;
}

/**
 * Get single feedback by ID.
 * @param {number} id - Feedback ID
 * @returns {Promise<Object|null>}
 */
async function getFeedbackById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT * FROM FeedbackTable WHERE Id = @Id');
  return result.recordset[0] || null;
}

/**
 * Update feedback by ID.
 * @param {Object} data - Feedback update data { id, comments, typeID }
 */
async function updateFeedback(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('Id', sql.Int, data.id)
    .input('Comments', sql.NVarChar(sql.MAX), data.comments)
    .input('TypeID', sql.Int, data.typeID)
    .query('UPDATE FeedbackTable SET Comments = @Comments, TypeID = @TypeID WHERE Id = @Id');
}

/**
 * Delete feedback by ID.
 * @param {number} id - Feedback ID to delete
 */
async function deleteFeedback(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM FeedbackTable WHERE Id = @Id');
}

/**
 * Get all feedback types (categories).
 * @returns {Promise<Array>}
 */
async function getFeedbackTypes() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .query('SELECT * FROM FeedbackTypeTable ORDER BY TypeName');
  return result.recordset;
}

/**
 * Get feedback analytics for an employee (aggregate counts per TypeID).
 * @param {string} empId - Employee ID
 * @returns {Promise<Array>}
 */
async function getFeedbackAnalytics(empId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), empId)
    .query(`
      SELECT TypeID, COUNT(*) AS Count
      FROM FeedbackTable
      WHERE ToEmpID = @EmpID
      GROUP BY TypeID
    `);
  return result.recordset;
}

/**
 * Respond to feedback by adding response and marking status as 'Responded'.
 * @param {number} id - Feedback ID
 * @param {string} response - Response comments
 * @param {string} responderEmpID - Employee ID who responded
 */
async function respondToFeedback(id, response, responderEmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('Id', sql.Int, id)
    .input('Response', sql.NVarChar(sql.MAX), response)
    .input('ResponderEmpID', sql.VarChar(30), responderEmpID)
    .input('RespondedAt', sql.DateTime, new Date())
    .query(`
      UPDATE FeedbackTable
      SET Response = @Response,
          ResponderEmpID = @ResponderEmpID,
          RespondedAt = @RespondedAt,
          Status = 'Responded'
      WHERE Id = @Id
    `);
}

/**
 * Mark feedback as read by ID.
 * @param {number} id - Feedback ID
 */
async function markFeedbackAsRead(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('Id', sql.Int, id)
    .query("UPDATE FeedbackTable SET Status = 'Read' WHERE Id = @Id");
}

/**
 * Get feedback for a team.
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>}
 */
async function getTeamFeedback(teamId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('TeamId', sql.Int, teamId)
    .query(`
      SELECT f.*
      FROM FeedbackTable f
      INNER JOIN EmployeeTable e ON f.ToEmpID = e.EmpID
      WHERE e.TeamId = @TeamId
      ORDER BY f.CreatedAt DESC
    `);
  return result.recordset;
}

/**
 * Generate feedback report filtered by date range and optional employee.
 * @param {Object} filters - Filters: { fromDate, toDate, EmpID }
 * @returns {Promise<Array>}
 */
async function generateFeedbackReport(filters) {
  const pool = await sql.connect(dbConfig);
  const { fromDate, toDate, EmpID } = filters;

  let query = `
    SELECT ToEmpID, TypeID, COUNT(*) AS FeedbackCount
    FROM FeedbackTable
    WHERE CreatedAt BETWEEN @FromDate AND @ToDate
  `;

  if (EmpID) {
    query += ` AND ToEmpID = @EmpID`;
  }

  query += ` GROUP BY ToEmpID, TypeID`;

  const request = pool.request()
    .input('FromDate', sql.DateTime, fromDate || new Date('2000-01-01'))
    .input('ToDate', sql.DateTime, toDate || new Date());

  if (EmpID) {
    request.input('EmpID', sql.VarChar(30), EmpID);
  }

  const result = await request.query(query);
  return result.recordset;
}

module.exports = {
  submitFeedback,
  getFeedbackHistory,
  getReceivedFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackTypes,
  getFeedbackAnalytics,
  respondToFeedback,
  markFeedbackAsRead,
  getTeamFeedback,
  generateFeedbackReport,
};
