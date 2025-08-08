const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get all notifications for an employee
async function getNotifications(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM NotificationTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID ORDER BY CreatedDate DESC');
  return res.recordset;
}

// Create a new notification for a user
async function createNotification(data, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('NotificationID', sql.VarChar(30), data.NotificationID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('Title', sql.VarChar(100), data.Title)
    .input('Body', sql.VarChar(500), data.Body)
    .input('Status', sql.VarChar(20), 'Unread')
    .input('CreatedDate', sql.Date, data.CreatedDate || new Date())
    .input('NotificationType', sql.VarChar(20), data.NotificationType || null)
    .query(`
      INSERT INTO NotificationTable (NotificationID, EmpID, CompanyID, Title, Body, Status, CreatedDate, NotificationType)
      VALUES (@NotificationID, @EmpID, @CompanyID, @Title, @Body, @Status, @CreatedDate, @NotificationType)
    `);
}

// Broadcast notification to all employees (uses NotificationTable, one row per EmpID)
async function broadcastNotification(data, allEmpIDs, CompanyID) {
  const pool = await sql.connect(dbConfig);
  for (const EmpID of allEmpIDs) {
    await pool.request()
      .input('NotificationID', sql.VarChar(30), data.NotificationID + '_' + EmpID)
      .input('EmpID', sql.VarChar(30), EmpID)
      .input('CompanyID', sql.VarChar(30), CompanyID)
      .input('Title', sql.VarChar(100), data.Title)
      .input('Body', sql.VarChar(500), data.Body)
      .input('Status', sql.VarChar(20), 'Unread')
      .input('CreatedDate', sql.Date, data.CreatedDate || new Date())
      .input('NotificationType', sql.VarChar(20), data.NotificationType || 'Broadcast')
      .query(`
        INSERT INTO NotificationTable (NotificationID, EmpID, CompanyID, Title, Body, Status, CreatedDate, NotificationType)
        VALUES (@NotificationID, @EmpID, @CompanyID, @Title, @Body, @Status, @CreatedDate, @NotificationType)
      `);
  }
}

module.exports = {
  getNotifications,
  createNotification,
  broadcastNotification,
};
