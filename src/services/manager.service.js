const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get all direct reports (team) for a manager
async function getTeam(ManagerEmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), ManagerEmpID)
    .query('SELECT * FROM EmpProfileTable WHERE ManagerEmpID=@ManagerEmpID');
  return result.recordset;
}

// Bulk-approve requests for a list of EmpIDs (leaves/excuses)
async function bulkApprove({ EmpIDs, type, action }) {
  const pool = await sql.connect(dbConfig);
  
  if (type === 'leave') {
    for (const empId of EmpIDs) {
      await pool.request()
        .input('EmpID', sql.VarChar(30), empId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .query(`UPDATE LeaveReqTable SET Status=@Status WHERE EmpID=@EmpID AND Status='Pending'`);
    }
  } else if (type === 'excuse') {
    for (const empId of EmpIDs) {
      await pool.request()
        .input('EmpID', sql.VarChar(30), empId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .query(`UPDATE ExcuseReqTable SET Status=@Status WHERE EmpID=@EmpID AND Status='Pending'`);
    }
  }
  return { updated: EmpIDs.length };
}

// Get all approvals pending for this manager's direct reports
async function getPendingApprovals(ManagerEmpID) {
  const pool = await sql.connect(dbConfig);

  // Get the manager's team
  const teamResult = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), ManagerEmpID)
    .query('SELECT EmpID FROM EmpProfileTable WHERE ManagerEmpID=@ManagerEmpID');
  const empIds = teamResult.recordset.map(e => e.EmpID);

  // Pending leaves
  const leaveRequests = empIds.length > 0 ? (
    await pool.request()
      .query(`SELECT * FROM LeaveReqTable WHERE Status='Pending' AND EmpID IN ('${empIds.join("','")}')`)
  ).recordset : [];

  // Pending excuses
  const excuseRequests = empIds.length > 0 ? (
    await pool.request()
      .query(`SELECT * FROM ExcuseReqTable WHERE Status='Pending' AND EmpID IN ('${empIds.join("','")}')`)
  ).recordset : [];

  return { leaveRequests, excuseRequests };
}

// Get profile of a team member
async function getTeamMemberDetails(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM EmpProfileTable WHERE EmpID=@EmpID');
  return result.recordset[0];
}

// Simple dashboard: return team count & pending requests
async function getManagerDashboard(ManagerEmpID) {
  const pool = await sql.connect(dbConfig);
  // Team count
  const teamResult = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), ManagerEmpID)
    .query('SELECT COUNT(*) as TeamSize FROM EmpProfileTable WHERE ManagerEmpID=@ManagerEmpID');
  // Pending requests
  const pendingLeave = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), ManagerEmpID)
    .query(`SELECT COUNT(*) as PendingLeaves FROM LeaveReqTable l 
            JOIN EmpProfileTable e ON l.EmpID = e.EmpID 
            WHERE l.Status = 'Pending' AND e.ManagerEmpID=@ManagerEmpID`);
  return {
    teamSize: teamResult.recordset[0]?.TeamSize || 0,
    pendingLeaves: pendingLeave.recordset[0]?.PendingLeaves || 0,
  };
}

// Attendance summary for all team members (number of leaves, excuses per month)
async function getTeamAttendanceSummary(ManagerEmpID, month, year) {
  const pool = await sql.connect(dbConfig);
  // Find team members
  const team = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), ManagerEmpID)
    .query('SELECT EmpID, Name FROM EmpProfileTable WHERE ManagerEmpID=@ManagerEmpID');
  const summary = [];
  for (const member of team.recordset) {
    const leaves = await pool.request()
      .input('EmpID', sql.VarChar(30), member.EmpID)
      .input('Month', sql.Int, month)
      .input('Year', sql.Int, year)
      .query(`SELECT COUNT(*) as LeaveCount FROM LeaveReqTable 
               WHERE EmpID=@EmpID AND MONTH(FromDate)=@Month AND YEAR(FromDate)=@Year`);
    const excuses = await pool.request()
      .input('EmpID', sql.VarChar(30), member.EmpID)
      .input('Month', sql.Int, month)
      .input('Year', sql.Int, year)
      .query(`SELECT COUNT(*) as ExcuseCount FROM ExcuseReqTable 
               WHERE EmpID=@EmpID AND MONTH(Date)=@Month AND YEAR(Date)=@Year`);
    summary.push({
      EmpID: member.EmpID,
      Name: member.Name,
      LeaveCount: leaves.recordset[0]?.LeaveCount || 0,
      ExcuseCount: excuses.recordset[0]?.ExcuseCount || 0,
    });
  }
  return summary;
}

// Search team members by name/email
async function searchTeamMembers(ManagerEmpID, search) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), ManagerEmpID)
    .input('search', sql.VarChar(100), `%${search}%`)
    .query(`SELECT * FROM EmpProfileTable 
              WHERE ManagerEmpID=@ManagerEmpID 
              AND (Name LIKE @search OR email LIKE @search)`);
  return result.recordset;
}

// Assign a task (not in ERD, but can be stubbed)
async function assignTask(ToEmpID, data) {
  // No TaskTable in ERD. You can log/return a stub.
  return { message: `Task assignment is not implemented in the current schema.` };
}

// Update a team member's profile (only allowed fields)
async function updateTeamMember(EmpID, data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('Name', sql.VarChar(100), data.Name)
    .input('contact', sql.VarChar(15), data.contact)
    .input('email', sql.VarChar(50), data.email)
    .input('address', sql.VarChar(100), data.address)
    .query('UPDATE EmpProfileTable SET Name=@Name, contact=@contact, email=@email, address=@address WHERE EmpID=@EmpID');
  return { message: "Team member profile updated." };
}

// "Performance" - not in ERD, just stub return
async function getTeamPerformance(ManagerEmpID) {
  // Stub: you may use number of leaves, tenure, etc. as makes sense
  return { error: "Team performance analytics not implemented in ER diagram." };
}

module.exports = {
  getTeam,
  bulkApprove,
  getPendingApprovals,
  getTeamMemberDetails,
  getManagerDashboard,
  getTeamAttendanceSummary,
  searchTeamMembers,
  assignTask,
  updateTeamMember,
  getTeamPerformance,
};
