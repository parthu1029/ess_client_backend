const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Mark attendance (insert or update for date)
async function markAttendance(EmpID, CompanyID, data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Date', sql.Date, data.date)
    .input('CheckIn', sql.Time, data.checkIn)
    .input('CheckOut', sql.Time, data.checkOut)
    .query(`
      MERGE CheckinCheckoutTable AS target
      USING (SELECT @EmpID AS EmpID, @Date AS Date, @CompanyID AS CompanyID) AS source
      ON (target.EmpID = source.EmpID AND target.Date = source.Date AND target.CompanyID = source.CompanyID)
      WHEN MATCHED THEN
        UPDATE SET CheckIn = @CheckIn, CheckOut = @CheckOut
      WHEN NOT MATCHED THEN
        INSERT (EmpID, CompanyID, Date, CheckIn, CheckOut)
        VALUES (@EmpID,@CompanyID, @Date, @CheckIn, @CheckOut); 
    `);
}

// Helper function to format time as HH:mm:ss
function formatTime(isoTime) {
  const date = new Date(isoTime);  // Create a Date object from the ISO string
  const hours = String(date.getUTCHours()).padStart(2, '0');  // Get hours and pad with leading 0
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');  // Get minutes and pad
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');  // Get seconds and pad
  return `${hours}:${minutes}:${seconds}`;  // Return formatted time (HH:mm:ss)
}

// Helper function to format date as YYYY-MM-DD
function formatDate(isoDate) {
  const date = new Date(isoDate);  // Create a Date object from the ISO string
  const year = date.getUTCFullYear();  // Get the year
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');  // Get the month (0-based, add 1)
  const day = String(date.getUTCDate()).padStart(2, '0');  // Get the day of the month
  return `${year}-${month}-${day}`;  // Return formatted date (YYYY-MM-DD)
}

async function getCheckinCheckoutHistory(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT Date, CheckIn, CheckOut FROM CheckinCheckoutTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID ORDER BY Date DESC');
  
  // Format CheckIn and CheckOut times
  const formattedData = result.recordset.map(item => ({
    Date: formatDate(item.Date),  // Format Date as YYYY-MM-DD
    CheckIn: formatTime(item.CheckIn),  // Format CheckIn time to only show the time part
    CheckOut: formatTime(item.CheckOut)  // Format CheckOut time to only show the time part
  }));

  return formattedData;  // Return the formatted result
}

module.exports = {
  markAttendance,
  getCheckinCheckoutHistory
};
