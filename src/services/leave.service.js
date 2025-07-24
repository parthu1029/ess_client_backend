const { pool } = require('../config/database');
const sql = require('mssql');

exports.checkDateConflicts = async (empId, fromDate, toDate) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('fromDate', sql.DateTime, fromDate);
    request.input('toDate', sql.DateTime, toDate);
    
    const result = await request.query(`
        SELECT * FROM LeaveReqTable 
        WHERE EmpID = @empId AND Status IN ('Pending', 'Approved')
        AND ((@fromDate BETWEEN FromDate AND ToDate) OR (@toDate BETWEEN FromDate AND ToDate))
    `);
    
    return result.recordset.length > 0;
};

exports.applyLeave = async (leaveData) => {
    const request = pool.request();
    request.input('leaveId', sql.Int, leaveData.leaveId);
    request.input('empId', sql.VarChar(30), leaveData.empId);
    request.input('fromDate', sql.DateTime, leaveData.fromDate);
    request.input('toDate', sql.DateTime, leaveData.toDate);
    request.input('type', sql.VarChar(4), leaveData.type);
    
    await request.query(`
        INSERT INTO LeaveReqTable (LeaveID, EmpID, FromDate, ToDate, Type, RequestDate, Status)
        VALUES (@leaveId, @empId, @fromDate, @toDate, @type, GETDATE(), 'Pending')
    `);
};

exports.getManagerId = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT ManagerEmpID FROM EmpProfileTable WHERE EmpID = @empId
    `);
    
    return result.recordset[0]?.ManagerEmpID;
};

exports.getLeaveBalance = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            l.Type,
            l.Description,
            COALESCE(SUM(CASE WHEN lr.Status = 'Approved' THEN DATEDIFF(day, lr.FromDate, lr.ToDate) + 1 ELSE 0 END), 0) as Used,
            (CASE 
                WHEN l.Type = 'SL' THEN 12
                WHEN l.Type = 'CL' THEN 12
                WHEN l.Type = 'PL' THEN 21
                ELSE 0
            END) as Total
        FROM LeaveTable l
        LEFT JOIN LeaveReqTable lr ON l.LeaveID = lr.LeaveID AND lr.EmpID = @empId 
            AND YEAR(lr.FromDate) = YEAR(GETDATE())
        GROUP BY l.Type, l.Description
    `);
    
    return result.recordset.map(item => ({
        type: item.Type,
        description: item.Description,
        total: item.Total,
        used: item.Used,
        remaining: item.Total - item.Used
    }));
};

exports.getLeaveHistory = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT lr.LeaveReqID, lr.FromDate, lr.ToDate, lr.Type, lr.Status, lr.RequestDate, l.Description
        FROM LeaveReqTable lr
        JOIN LeaveTable l ON lr.LeaveID = l.LeaveID
        WHERE lr.EmpID = @empId
        ORDER BY lr.RequestDate DESC
    `);
    
    return result.recordset;
};

exports.getLeaveTypes = async () => {
    const request = pool.request();
    const result = await request.query(`
        SELECT LeaveID, Type, Description
        FROM LeaveTable
        ORDER BY Type
    `);
    
    return result.recordset;
};
exports.getLeaveStatus = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            lr.LeaveReqID,
            lr.FromDate,
            lr.ToDate,
            lr.Type,
            lr.Status,
            lr.RequestDate,
            l.Description,
            DATEDIFF(day, lr.FromDate, lr.ToDate) + 1 as Days
        FROM LeaveReqTable lr
        JOIN LeaveTable l ON lr.LeaveID = l.LeaveID
        WHERE lr.EmpID = @empId
        ORDER BY lr.RequestDate DESC
    `);
    
    return result.recordset;
};

exports.cancelLeave = async (leaveId, empId) => {
    const request = pool.request();
    request.input('leaveId', sql.Int, leaveId);
    request.input('empId', sql.VarChar(30), empId);
    
    // Check if leave can be cancelled (only pending leaves)
    const checkResult = await request.query(`
        SELECT Status FROM LeaveReqTable 
        WHERE LeaveReqID = @leaveId AND EmpID = @empId
    `);
    
    if (checkResult.recordset.length === 0) {
        throw new Error('Leave request not found');
    }
    
    if (checkResult.recordset[0].Status !== 'Pending') {
        throw new Error('Only pending leaves can be cancelled');
    }
    
    await request.query(`
        UPDATE LeaveReqTable 
        SET Status = 'Cancelled'
        WHERE LeaveReqID = @leaveId AND EmpID = @empId
    `);
};

exports.approveRejectLeave = async (leaveId, action, remarks) => {
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    
    const request = pool.request();
    request.input('leaveId', sql.Int, leaveId);
    request.input('status', sql.VarChar(15), status);
    request.input('remarks', sql.VarChar(500), remarks);
    
    // Get employee ID for notification
    const empResult = await request.query(`
        SELECT EmpID FROM LeaveReqTable WHERE LeaveReqID = @leaveId
    `);
    
    await request.query(`
        UPDATE LeaveReqTable 
        SET Status = @status, ManagerRemarks = @remarks
        WHERE LeaveReqID = @leaveId
    `);
    
    return { empId: empResult.recordset[0].EmpID };
};