const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Mark attendance (insert or update for date)
async function markAttendance(EmpID, data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Date', sql.Date, data.date)
    .input('Status', sql.VarChar(10), data.status) // e.g., 'Present', 'Absent'
    .input('CheckIn', sql.Time, data.checkIn)
    .input('CheckOut', sql.Time, data.checkOut)
    .query(`
      MERGE AttendanceTable AS target
      USING (SELECT @EmpID AS EmpID, @Date AS Date) AS source
      ON (target.EmpID = source.EmpID AND target.Date = source.Date)
      WHEN MATCHED THEN
        UPDATE SET Status = @Status, CheckIn = @CheckIn, CheckOut = @CheckOut
      WHEN NOT MATCHED THEN
        INSERT (EmpID, Date, Status, CheckIn, CheckOut)
        VALUES (@EmpID, @Date, @Status, @CheckIn, @CheckOut); 
    `);
}

// Get attendace status for the day
async function getDailyStatus(EmpID, date) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Date', sql.Date, date)
    .query('SELECT Status FROM AttendanceTable WHERE EmpID = @EmpID AND Date = @Date');
  return result.recordset[0];
}

// Get attendance history (all records)
async function getAttendanceHistory(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM AttendanceTable WHERE EmpID = @EmpID ORDER BY Date DESC');
  return result.recordset;
}

// Get monthly summary
async function getMonthlySummary(EmpID, month, year) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Month', sql.Int, month)
    .input('Year', sql.Int, year)
    .query(`
      SELECT Status, COUNT(*) AS Days
      FROM AttendanceTable 
      WHERE EmpID = @EmpID 
        AND MONTH(Date) = @Month 
        AND YEAR(Date) = @Year
      GROUP BY Status
    `);
  return result.recordset;
}

// Update a day's attendance record
async function updateAttendance(EmpID, data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Date', sql.Date, data.date)
    .input('Status', sql.VarChar(10), data.status)
    .input('CheckIn', sql.Time, data.checkIn)
    .input('CheckOut', sql.Time, data.checkOut)
    .query(`UPDATE AttendanceTable  
            SET Status = @Status, CheckIn = @CheckIn, CheckOut = @CheckOut
            WHERE EmpID = @EmpID AND Date = @Date`);
}

// Get check-in/check-out times for a specific date
async function getCheckinCheckoutTime(EmpID, date) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Date', sql.Date, date)
    .query('SELECT CheckIn, CheckOut FROM AttendanceTable WHERE EmpID=@EmpID AND Date=@Date');
  return result.recordset[0];
}

// Full check-in/out times history
async function getCheckinCheckoutHistory(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT Date, CheckIn, CheckOut FROM AttendanceTable WHERE EmpID=@EmpID ORDER BY Date DESC');
  return result.recordset;
}

module.exports = {
  markAttendance,
  getDailyStatus,
  getAttendanceHistory,
  getMonthlySummary,
  updateAttendance,
  getCheckinCheckoutTime,
  getCheckinCheckoutHistory
};
