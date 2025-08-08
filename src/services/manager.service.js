const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Bulk-approve requests for a list of EmpIDs (leaves/excuses)
async function bulkApproveReject({ ReqIDs, type, action,  comment },approverEmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  
  if (type === 'leave') {
    for (const reqId of ReqIDs) {
      await pool.request()
        .input('ReqID', sql.VarChar(30), reqId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .input('CompanyID', sql.VarChar(30), CompanyID)
        .input('ApproverEmpID', sql.VarChar(30), approverEmpID)
        .input('Comment', sql.VarChar(500), comment)
        .query(`UPDATE LeaveReqTable SET Status=@Status, CompanyID=@CompanyID, ApproverEmpID=@ApproverEmpID, Comment=@Comment WHERE reqID=@ReqID AND Status='Pending'`);
    }
  } else if (type === 'excuse') {
    for (const reqId of ReqIDs) {
      await pool.request()
        .input('ReqID', sql.VarChar(30), reqId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .input('CompanyID', sql.VarChar(30), CompanyID)
        .input('ApproverEmpID', sql.VarChar(30), approverEmpID)
        .input('Comment', sql.VarChar(500), comment)
        .query(`UPDATE ExcuseReqTable SET Status=@Status, CompanyID=@CompanyID, ApproverEmpID=@ApproverEmpID, Comment=@Comment WHERE reqID=@ReqID AND Status='Pending'`);
    }
  } else if (type === 'businessTrip') {
    for (const reqId of ReqIDs) {
      await pool.request()
        .input('ReqID', sql.VarChar(30), reqId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .input('CompanyID', sql.VarChar(30), CompanyID)
        .input('ApproverEmpID', sql.VarChar(30), approverEmpID)
        .input('Comment', sql.VarChar(500), comment)
        .query(`UPDATE BusinessTripReqTable SET Status=@Status, CompanyID=@CompanyID, ApproverEmpID=@ApproverEmpID, Comment=@Comment WHERE reqID=@ReqID AND Status='Pending'`);
    }
  } else if (type === 'reimbursement') {
    for (const reqId of ReqIDs) {
      await pool.request()
        .input('ReqID', sql.VarChar(30), reqId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .input('CompanyID', sql.VarChar(30), CompanyID)
        .input('ApproverEmpID', sql.VarChar(30), approverEmpID)
        .input('Comment', sql.VarChar(500), comment)
        .query(`UPDATE ReimbursementReqTable SET Status=@Status, CompanyID=@CompanyID, ApproverEmpID=@ApproverEmpID, Comment=@Comment WHERE reqID=@ReqID AND Status='Pending'`);
    }
  } else if (type === 'document') {
    for (const reqId of ReqIDs) {
      await pool.request()
        .input('ReqID', sql.VarChar(30), reqId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .input('CompanyID', sql.VarChar(30), CompanyID)
        .input('ApproverEmpID', sql.VarChar(30), approverEmpID)
        .input('Comment', sql.VarChar(500), comment)
        .query(`UPDATE DocumentReqTable SET Status=@Status, CompanyID=@CompanyID, ApproverEmpID=@ApproverEmpID, Comment=@Comment WHERE reqID=@ReqID AND Status='Pending'`);
    }
  } else if (type === 'flightTicket') {
    for (const reqId of ReqIDs) {
      await pool.request()
        .input('ReqID', sql.VarChar(30), reqId)
        .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
        .input('CompanyID', sql.VarChar(30), CompanyID)
        .input('ApproverEmpID', sql.VarChar(30), approverEmpID)
        .input('Comment', sql.VarChar(500), comment)
        .query(`UPDATE FlightTicketReqTable SET Status=@Status, CompanyID=@CompanyID, ApproverEmpID=@ApproverEmpID, Comment=@Comment WHERE reqID=@ReqID AND Status='Pending'`);
    }
  } 
  return { updated: ReqIDs.length };
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

module.exports = {
  bulkApproveReject,
  getTeamAttendanceSummary
};
