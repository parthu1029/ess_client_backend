const sql = require('mssql');
const dbConfig = require('../config/db.config');

// Get a full team hierarchy (recursive subordinates) for a given manager
async function getTeamHierarchy(managerEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Fetch direct reports
  const direct = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), managerEmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, Name, Position FROM EmpProfileTable WHERE ManagerEmpID=@ManagerEmpID AND CompanyID=@CompanyID');
  const team = [];
  for (const emp of direct.recordset) {
    // Recursively get that employee's team
    const reports = await getTeamHierarchy(emp.EmpID, CompanyID);
    team.push({
      EmpID: emp.EmpID,
      Name: emp.Name,
      Position: emp.Position,
      Reports: reports
    });
  }
  return team;
}

// Get team calendar: leave/business trips for all direct reports (not recursive)
async function getTeamCalendar(managerEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Get direct reports' EmpIDs
  const employeesRes = await pool.request()
    .input('ManagerEmpID', sql.VarChar(30), managerEmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, Name FROM EmpProfileTable WHERE ManagerEmpID=@ManagerEmpID AND CompanyID=@CompanyID');

  const employees = employeesRes.recordset;

  if (employees.length === 0) return [];

  // Build a lookup of EmpID -> { Name }
  const empLookup = {};
  employees.forEach(emp => { empLookup[emp.EmpID] = emp.Name; });
  const empIDs = employees.map(emp => emp.EmpID);

  // Get leave and business trip data
  const leaveResult = await pool.request()
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query(`
      SELECT EmpID, FromDate, ToDate, Type, Status
      FROM LeaveReqTable
      WHERE EmpID IN (${empIDs.map(e => `'${e}'`).join(',')}) AND CompanyID=@CompanyID
    `);

  const tripResult = await pool.request()
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query(`
      SELECT EmpID, StartDate, EndDate, Location, status
      FROM BusinessTripReqTable
      WHERE EmpID IN (${empIDs.map(e => `'${e}'`).join(',')}) AND CompanyID=@CompanyID
    `);

  // Collate results per employee
  const calendar = {};
  empIDs.forEach(id => calendar[id] = { Name: empLookup[id], Leaves: [], Trips: [] });
  for (const leave of leaveResult.recordset) {
    calendar[leave.EmpID].Leaves.push({
      FromDate: leave.FromDate, ToDate: leave.ToDate, Type: leave.Type, Status: leave.Status
    });
  }
  for (const trip of tripResult.recordset) {
    calendar[trip.EmpID].Trips.push({
      StartDate: trip.StartDate, EndDate: trip.EndDate, Location: trip.Location, Status: trip.status
    });
  }
  // Convert to array for return
  return Object.keys(calendar).map(EmpID => ({ EmpID, ...calendar[EmpID] }));
}

module.exports = {
  getTeamHierarchy,
  getTeamCalendar,
};
