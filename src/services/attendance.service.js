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

// Full check-in/out times history
async function getCheckinCheckoutHistory(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT Date, CheckIn, CheckOut FROM CheckinCheckoutTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID ORDER BY Date DESC');
  return result.recordset;
}

module.exports = {
  markAttendance,
  getCheckinCheckoutHistory
};
