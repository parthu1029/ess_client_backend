const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get all notifications for an employee
async function getNotifications(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM NotificationTable WHERE EmpID=@EmpID ORDER BY CreatedDate DESC');
  return res.recordset;
}

// Get only unread notifications
async function getUnreadNotifications(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query("SELECT * FROM NotificationTable WHERE EmpID=@EmpID AND Status='Unread' ORDER BY CreatedDate DESC");
  return res.recordset;
}

// Mark single notification as read
async function markAsRead(NotificationID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('NotificationID', sql.VarChar(30), NotificationID)
    .query("UPDATE NotificationTable SET Status='Read' WHERE NotificationID=@NotificationID");
}

// Mark all notifications as read for an employee
async function markAllAsRead(EmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query("UPDATE NotificationTable SET Status='Read' WHERE EmpID=@EmpID AND Status='Unread'");
}

// Delete a notification (user deletes their own)
async function deleteNotification(NotificationID, EmpID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('NotificationID', sql.VarChar(30), NotificationID)
    .input('EmpID', sql.VarChar(30), EmpID)
    .query("DELETE FROM NotificationTable WHERE NotificationID=@NotificationID AND EmpID=@EmpID");
}

// Admin delete (delete any notification)
async function deleteNotificationAdmin(NotificationID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('NotificationID', sql.VarChar(30), NotificationID)
    .query("DELETE FROM NotificationTable WHERE NotificationID=@NotificationID");
}

// Create a new notification for a user
async function createNotification(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('NotificationID', sql.VarChar(30), data.NotificationID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('Title', sql.VarChar(100), data.Title)
    .input('Body', sql.VarChar(500), data.Body)
    .input('Status', sql.VarChar(20), 'Unread')
    .input('CreatedDate', sql.Date, data.CreatedDate || new Date())
    .input('NotificationType', sql.VarChar(20), data.NotificationType || null)
    .query(`
      INSERT INTO NotificationTable (NotificationID, EmpID, Title, Body, Status, CreatedDate, NotificationType)
      VALUES (@NotificationID, @EmpID, @Title, @Body, @Status, @CreatedDate, @NotificationType)
    `);
}

// Broadcast notification to all employees (uses NotificationTable, one row per EmpID)
async function broadcastNotification(data, allEmpIDs) {
  const pool = await sql.connect(dbConfig);
  for (const EmpID of allEmpIDs) {
    await pool.request()
      .input('NotificationID', sql.VarChar(30), data.NotificationID + '_' + EmpID)
      .input('EmpID', sql.VarChar(30), EmpID)
      .input('Title', sql.VarChar(100), data.Title)
      .input('Body', sql.VarChar(500), data.Body)
      .input('Status', sql.VarChar(20), 'Unread')
      .input('CreatedDate', sql.Date, data.CreatedDate || new Date())
      .input('NotificationType', sql.VarChar(20), data.NotificationType || 'Broadcast')
      .query(`
        INSERT INTO NotificationTable (NotificationID, EmpID, Title, Body, Status, CreatedDate, NotificationType)
        VALUES (@NotificationID, @EmpID, @Title, @Body, @Status, @CreatedDate, @NotificationType)
      `);
  }
}

// Get all notifications (admin)
async function getAllNotifications() {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .query('SELECT * FROM NotificationTable ORDER BY CreatedDate DESC');
  return res.recordset;
}

// Get notification settings for an employee
async function getNotificationSettings(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM NotificationSettingsTable WHERE EmpID=@EmpID');
  return res.recordset[0] || null;
}

// Update notification settings for an employee
async function updateNotificationSettings(EmpID, settings) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Settings', sql.NVarChar(1000), JSON.stringify(settings))
    .query(`
      UPDATE NotificationSettingsTable SET Settings=@Settings WHERE EmpID=@EmpID;
      IF @@ROWCOUNT = 0
        INSERT INTO NotificationSettingsTable (EmpID, Settings) VALUES (@EmpID, @Settings)
    `);
}

// Get notification by ID
async function getNotificationById(NotificationID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('NotificationID', sql.VarChar(30), NotificationID)
    .query('SELECT * FROM NotificationTable WHERE NotificationID=@NotificationID');
  return res.recordset[0];
}

// Get notification stats: count unread, read, etc for user
async function getNotificationStats(EmpID) {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query(`
      SELECT Status, COUNT(*) as Count
      FROM NotificationTable
      WHERE EmpID=@EmpID
      GROUP BY Status
    `);
  return res.recordset;
}

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteNotificationAdmin,
  createNotification,
  broadcastNotification,
  getAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationById,
  getNotificationStats
};
