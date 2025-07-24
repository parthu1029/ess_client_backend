const { pool } = require('../config/database');
const sql = require('mssql');
const notificationService = require('./notificationService');

exports.getTeam = async (managerId) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    
    const result = await request.query(`
        SELECT 
            EmpID, 
            Name, 
            Position, 
            Grade, 
            DOJ,
            Email,
            Phone
        FROM EmpProfileTable
        WHERE ManagerEmpID = @managerId
        ORDER BY Name
    `);
    
    return result.recordset;
};

exports.getTeamMemberDetails = async (managerId, empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('managerId', sql.VarChar(30), managerId);
    
    const result = await request.query(`
        SELECT EmpID, Name, DOB, DOJ, Position, Grade
        FROM EmpProfileTable
        WHERE EmpID = @empId AND ManagerEmpID = @managerId
    `);
    
    return result.recordset[0] || null;
};

exports.getPendingApprovals = async (managerId) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    
    // Get pending leave requests
    const leaveResult = await request.query(`
        SELECT 
            lr.LeaveReqID,
            lr.EmpID,
            ep.Name as EmployeeName,
            lr.FromDate,
            lr.ToDate,
            lr.Type,
            lr.RequestDate,
            'leave' as ApprovalType,
            DATEDIFF(day, lr.FromDate, lr.ToDate) + 1 as Days
        FROM LeaveReqTable lr
        JOIN EmpProfileTable ep ON lr.EmpID = ep.EmpID
        WHERE ep.ManagerEmpID = @managerId AND lr.Status = 'Pending'
    `);
    
    // Get pending reimbursement requests
    const reimbResult = await request.query(`
        SELECT 
            r.ReimbursementID,
            r.EmpID,
            ep.Name as EmployeeName,
            r.Type,
            r.Amount,
            r.Comment,
            r.CreatedDate,
            'reimbursement' as ApprovalType
        FROM ReimbursementTable r
        JOIN EmpProfileTable ep ON r.EmpID = ep.EmpID
        WHERE ep.ManagerEmpID = @managerId AND r.Status = 'Pending'
    `);
    
    return {
        leaves: leaveResult.recordset,
        reimbursements: reimbResult.recordset
    };
};

exports.bulkApprove = async (type, ids, action, managerId) => {
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    
    if (type === 'leave') {
        await this.bulkApproveLeaves(ids, status);
    } else if (type === 'reimbursement') {
        await this.bulkApproveReimbursements(ids, status);
    }
    
    // Send notifications to affected employees
    await this.sendBulkNotifications(type, ids, status);
};

exports.bulkApproveLeaves = async (leaveIds, status) => {
    const request = pool.request();
    request.input('status', sql.VarChar(15), status);
    
    const idParams = leaveIds.map((id, index) => {
        const paramName = `id${index}`;
        request.input(paramName, sql.Int, id);
        return `@${paramName}`;
    });
    
    await request.query(`
        UPDATE LeaveReqTable
        SET Status = @status
        WHERE LeaveReqID IN (${idParams.join(',')})
    `);
};

exports.bulkApproveReimbursements = async (reimbIds, status) => {
    const request = pool.request();
    request.input('status', sql.VarChar(15), status);
    
    const idParams = reimbIds.map((id, index) => {
        const paramName = `id${index}`;
        request.input(paramName, sql.Int, id);
        return `@${paramName}`;
    });
    
    await request.query(`
        UPDATE ReimbursementTable
        SET Status = @status
        WHERE ReimbursementID IN (${idParams.join(',')})
    `);
};

exports.sendBulkNotifications = async (type, ids, status) => {
    const request = pool.request();
    
    let query, tableName, idColumn;
    if (type === 'leave') {
        tableName = 'LeaveReqTable';
        idColumn = 'LeaveReqID';
    } else if (type === 'reimbursement') {
        tableName = 'ReimbursementTable';
        idColumn = 'ReimbursementID';
    }
    
    const idParams = ids.map((id, index) => {
        const paramName = `id${index}`;
        request.input(paramName, sql.Int, id);
        return `@${paramName}`;
    });
    
    const result = await request.query(`
        SELECT DISTINCT EmpID FROM ${tableName}
        WHERE ${idColumn} IN (${idParams.join(',')})
    `);
    
    for (const emp of result.recordset) {
        await notificationService.sendNotification(
            emp.EmpID,
            `${type.charAt(0).toUpperCase() + type.slice(1)} Request Update`,
            `Your ${type} request has been ${status.toLowerCase()}`,
            type
        );
    }
};

exports.getTeamAttendanceSummary = async (managerId, filters = {}) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    request.input('month', sql.Int, filters.month || new Date().getMonth() + 1);
    request.input('year', sql.Int, filters.year || new Date().getFullYear());
    
    const result = await request.query(`
        SELECT 
            ep.EmpID,
            ep.Name,
            COUNT(at.Date) as WorkingDays,
            SUM(at.WorkingHours) as TotalHours,
            AVG(at.WorkingHours) as AvgHours,
            COUNT(CASE WHEN DATEPART(HOUR, at.CheckInTime) > 9 THEN 1 END) as LateDays
        FROM EmpProfileTable ep
        LEFT JOIN AttendanceTable at ON ep.EmpID = at.EmpID 
            AND MONTH(at.Date) = @month 
            AND YEAR(at.Date) = @year
        WHERE ep.ManagerEmpID = @managerId
        GROUP BY ep.EmpID, ep.Name
        ORDER BY ep.Name
    `);
    
    return result.recordset;
};

exports.searchTeamMembers = async (managerId, searchQuery) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    request.input('searchQuery', sql.VarChar(100), `%${searchQuery}%`);
    
    const result = await request.query(`
        SELECT EmpID, Name, Position, Grade
        FROM EmpProfileTable
        WHERE ManagerEmpID = @managerId 
        AND (Name LIKE @searchQuery OR EmpID LIKE @searchQuery OR Position LIKE @searchQuery)
        ORDER BY Name
    `);
    
    return result.recordset;
};

exports.getManagerDashboard = async (managerId) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    
    const [teamSize, pendingLeaves, pendingReimb, teamOnLeave] = await Promise.all([
        request.query(`SELECT COUNT(*) as TeamSize FROM EmpProfileTable WHERE ManagerEmpID = @managerId`),
        request.query(`
            SELECT COUNT(*) as PendingLeaves
            FROM LeaveReqTable lr
            JOIN EmpProfileTable ep ON lr.EmpID = ep.EmpID
            WHERE ep.ManagerEmpID = @managerId AND lr.Status = 'Pending'
        `),
        request.query(`
            SELECT COUNT(*) as PendingReimbursements
            FROM ReimbursementTable r
            JOIN EmpProfileTable ep ON r.EmpID = ep.EmpID
            WHERE ep.ManagerEmpID = @managerId AND r.Status = 'Pending'
        `),
        request.query(`
            SELECT COUNT(*) as TeamOnLeave
            FROM LeaveReqTable lr
            JOIN EmpProfileTable ep ON lr.EmpID = ep.EmpID
            WHERE ep.ManagerEmpID = @managerId 
            AND lr.Status = 'Approved' 
            AND GETDATE() BETWEEN lr.FromDate AND lr.ToDate
        `)
    ]);
    
    return {
        teamSize: teamSize.recordset[0].TeamSize,
        pendingLeaveApprovals: pendingLeaves.recordset[0].PendingLeaves,
        pendingReimbursementApprovals: pendingReimb.recordset[0].PendingReimbursements,
        teamOnLeaveToday: teamOnLeave.recordset[0].TeamOnLeave
    };
};
