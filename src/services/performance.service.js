const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Submit self-evaluation (not in ERD)
async function submitSelfEvaluation(data) {
  // No backing table - stub
  return { error: "Self-evaluations not implemented in current DB schema." };
}

// Get received feedback for current employee
async function getFeedback(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM FeedbackTable WHERE ToEmpID=@EmpID ORDER BY CreatedAt DESC');
  return res.recordset;
}

// Submit manager feedback (not in ERD)
async function submitManagerFeedback(data) {
  // No backing table - stub
  return { error: "Manager feedback not implemented in current DB schema." };
}

// Get performance reviews (not in ERD)
async function getPerformanceReviews(EmpID) {
  // No table for reviews - stub
  return { error: "Performance reviews not in database schema." };
}

// Create a performance goal (not in ERD)
async function createPerformanceGoal(data) {
  // No table for goals - stub
  return { error: "Performance goals are not present in schema." };
}

// Update a performance goal (not in ERD)
async function updatePerformanceGoal(goalId, data) {
  // No table for goals - stub
  return { error: "Performance goals are not present in schema." };
}

// List performance goals (not in ERD)
async function getPerformanceGoals(EmpID) {
  // No table for goals - stub
  return [];
}

// List performance metrics (not in ERD)
async function getPerformanceMetrics(EmpID) {
  // No performance metrics in schema
  return { error: "Performance metrics not available in schema." };
}

// Get all feedback sent to/by a peer for EmpID
async function getPeerFeedback(EmpID) {
  const pool = await sql.connect(dbConfig);
  // Any feedback that isn't manager-to-employee or self (assuming TypeID can distinguish, but not defined in your ERD)
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM FeedbackTable WHERE (FromEmpID!=ToEmpID AND ToEmpID=@EmpID) ORDER BY CreatedAt DESC');
  return res.recordset;
}

// Submit peer feedback
async function submitPeerFeedback(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('FromEmpID', sql.VarChar(30), data.fromEmpID)
    .input('ToEmpID', sql.VarChar(30), data.toEmpID)
    .input('TypeID', sql.Int, data.typeID || 2) // 2 if you maintain types (peer)
    .input('Comments', sql.NVarChar(sql.MAX), data.comments)
    .input('CreatedAt', sql.DateTime, new Date())
    .input('Status', sql.VarChar(20), 'New')
    .query(`INSERT INTO FeedbackTable (FromEmpID, ToEmpID, TypeID, Comments, CreatedAt, Status)
            VALUES (@FromEmpID, @ToEmpID, @TypeID, @Comments, @CreatedAt, @Status)`);
  return { message: "Peer feedback submitted." };
}

// Generate performance report (not in ERD)
async function generatePerformanceReport(filters) {
  // Could aggregate some feedback data here
  const pool = await sql.connect(dbConfig);
  const { EmpID, fromDate, toDate } = filters;
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('FromDate', sql.DateTime, fromDate || new Date('2000-01-01'))
    .input('ToDate', sql.DateTime, toDate || new Date())
    .query(`
      SELECT * FROM FeedbackTable
      WHERE ToEmpID=@EmpID AND CreatedAt BETWEEN @FromDate AND @ToDate
      ORDER BY CreatedAt DESC
    `);
  return result.recordset;
}

module.exports = {
  submitSelfEvaluation,
  getFeedback,
  submitManagerFeedback,
  getPerformanceReviews,
  createPerformanceGoal,
  updatePerformanceGoal,
  getPerformanceGoals,
  getPerformanceMetrics,
  getPeerFeedback,
  submitPeerFeedback,
  generatePerformanceReport
};
