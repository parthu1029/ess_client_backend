const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Generic helper to get DB connection pool
async function getPool() {
  return await sql.connect(dbConfig);
}

async function getDashboardData(tenantId, userId, query) {
  const pool = await getPool();
  
  // Example: replace with your actual dashboard data query or procedure per tenant/user
  const request = pool.request();
  // You can add inputs if needed based on tenantId, userId, query params...
  const result = await request.query(`SELECT TOP 10 * FROM DashboardDataTable WHERE TenantId = @TenantId ORDER BY CreatedAt DESC`, {
    TenantId: tenantId
  });
  
  return result.recordset;
}

async function getEmployeeDashboard(empId, tenantId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('EmpId', sql.VarChar(30), empId)
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT * FROM EmployeeDashboardData WHERE EmpId = @EmpId AND TenantId = @TenantId`);
  return result.recordset;
}

async function getManagerDashboard(managerId, tenantId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ManagerId', sql.VarChar(30), managerId)
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT * FROM ManagerDashboardData WHERE ManagerId = @ManagerId AND TenantId = @TenantId`);
  return result.recordset;
}

async function getAttendanceStats(tenantId, userId, query) {
  const pool = await getPool();
  const result = await pool.request()
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT Status, COUNT(*) AS Count FROM AttendanceTable WHERE TenantId=@TenantId GROUP BY Status`);
  return result.recordset;
}

async function getRecentActivities(tenantId, userId, query) {
  const pool = await getPool();
  const result = await pool.request()
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT TOP 20 ActivityType, Description, CreatedAt FROM ActivityLog WHERE TenantId=@TenantId ORDER BY CreatedAt DESC`);
  return result.recordset;
}

async function getPendingApprovals(managerId, tenantId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ManagerId', sql.VarChar(30), managerId)
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT * FROM ApprovalRequests WHERE ManagerId=@ManagerId AND TenantId=@TenantId AND Status='Pending' ORDER BY CreatedAt DESC`);
  return result.recordset;
}

async function getQuickStats(empId, tenantId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('EmpId', sql.VarChar(30), empId)
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT StatName, StatValue FROM QuickStats WHERE EmpId=@EmpId AND TenantId=@TenantId`);
  return result.recordset;
}

async function getTeamOverview(managerId, tenantId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ManagerId', sql.VarChar(30), managerId)
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT EmployeeId, Name, Status FROM TeamOverview WHERE ManagerId=@ManagerId AND TenantId=@TenantId`);
  return result.recordset;
}

async function getNotificationSummary(tenantId, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('TenantId', sql.Int, tenantId)
    .query(`SELECT NotificationType, COUNT(*) AS Count FROM Notifications WHERE TenantId=@TenantId GROUP BY NotificationType`);
  return result.recordset;
}

async function refreshDashboard(body, tenantId, userId) {
  // This can trigger a stored procedure or update cache, etc.
  // For example, updating user preferences or reload data
  const pool = await getPool();
  // Example: Here just return success and some refreshed timestamp
  return { refreshedAt: new Date() };
}

async function updateDashboardPreferences(empId, tenantId, preferences) {
  const pool = await getPool();
  // Example: Update user preferences (assuming JSON stored as string)
  await pool.request()
    .input('EmpId', sql.VarChar(30), empId)
    .input('TenantId', sql.Int, tenantId)
    .input('Preferences', sql.NVarChar(sql.MAX), JSON.stringify(preferences))
    .query(`UPDATE DashboardPreferences SET Preferences = @Preferences WHERE EmpId = @EmpId AND TenantId = @TenantId`);
  
  return { message: 'Preferences updated' };
}

module.exports = {
  getDashboardData,
  getEmployeeDashboard,
  getManagerDashboard,
  getAttendanceStats,
  getRecentActivities,
  getPendingApprovals,
  getQuickStats,
  getTeamOverview,
  getNotificationSummary,
  refreshDashboard,
  updateDashboardPreferences,
};
