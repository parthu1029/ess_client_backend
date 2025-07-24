const { pool } = require('../config/database');
const sql = require('mssql');

exports.submitExcuse = async (excuseData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), excuseData.empId);
    request.input('type', sql.VarChar(50), excuseData.type);
    request.input('reason', sql.VarChar(500), excuseData.reason);
    request.input('excuseDate', sql.Date, excuseData.excuseDate);
    request.input('duration', sql.VarChar(20), excuseData.duration); // 'Full Day', 'Half Day', 'Hours'
    request.input('status', sql.VarChar(15), 'Pending');
    
    // Handle attachment
    if (excuseData.attachmentData) {
        request.input('attachmentContent', sql.VarBinary(sql.MAX), excuseData.attachmentData.buffer);
        request.input('attachmentFileName', sql.VarChar(200), excuseData.attachmentData.fileName);
        request.input('attachmentMimeType', sql.VarChar(100), excuseData.attachmentData.mimeType);
        request.input('attachmentSize', sql.Int, excuseData.attachmentData.size);
    } else {
        request.input('attachmentContent', sql.VarBinary(sql.MAX), null);
        request.input('attachmentFileName', sql.VarChar(200), null);
        request.input('attachmentMimeType', sql.VarChar(100), null);
        request.input('attachmentSize', sql.Int, null);
    }
    
    const result = await request.query(`
        INSERT INTO ExcuseTable 
        (EmpID, Type, Reason, ExcuseDate, Duration, Status, SubmissionDate,
         AttachmentContent, AttachmentFileName, AttachmentMimeType, AttachmentSize)
        VALUES 
        (@empId, @type, @reason, @excuseDate, @duration, @status, GETDATE(),
         @attachmentContent, @attachmentFileName, @attachmentMimeType, @attachmentSize);
        SELECT SCOPE_IDENTITY() as ExcuseID;
    `);
    
    return result.recordset[0].ExcuseID;
};

exports.getExcuseHistory = async (empId, filters = {}) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    let query = `
        SELECT 
            ExcuseID,
            Type,
            Reason,
            ExcuseDate,
            Duration,
            Status,
            SubmissionDate,
            ProcessedDate,
            ManagerRemarks,
            CASE WHEN AttachmentContent IS NOT NULL THEN 1 ELSE 0 END as HasAttachment
        FROM ExcuseTable
        WHERE EmpID = @empId
    `;
    
    if (filters.startDate) {
        request.input('startDate', sql.Date, filters.startDate);
        query += ` AND ExcuseDate >= @startDate`;
    }
    
    if (filters.endDate) {
        request.input('endDate', sql.Date, filters.endDate);
        query += ` AND ExcuseDate <= @endDate`;
    }
    
    if (filters.status) {
        request.input('status', sql.VarChar(15), filters.status);
        query += ` AND Status = @status`;
    }
    
    query += ` ORDER BY SubmissionDate DESC`;
    
    const result = await request.query(query);
    return result.recordset;
};

exports.getExcuseStatus = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            Status,
            COUNT(*) as Count,
            Type,
            COUNT(CASE WHEN Type = 'Late Arrival' THEN 1 END) as LateCount,
            COUNT(CASE WHEN Type = 'Early Leave' THEN 1 END) as EarlyLeaveCount,
            COUNT(CASE WHEN Type = 'Absence' THEN 1 END) as AbsenceCount
        FROM ExcuseTable
        WHERE EmpID = @empId
        AND YEAR(ExcuseDate) = YEAR(GETDATE())
        GROUP BY Status, Type
    `);
    
    return result.recordset;
};

exports.approveRejectExcuse = async (excuseId, action, remarks) => {
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    
    const request = pool.request();
    request.input('excuseId', sql.Int, excuseId);
    request.input('status', sql.VarChar(15), status);
    request.input('remarks', sql.VarChar(500), remarks);
    
    // Get employee ID for notification
    const empResult = await request.query(`
        SELECT EmpID FROM ExcuseTable WHERE ExcuseID = @excuseId
    `);
    
    await request.query(`
        UPDATE ExcuseTable 
        SET Status = @status, 
            ManagerRemarks = @remarks,
            ProcessedDate = GETDATE()
        WHERE ExcuseID = @excuseId
    `);
    
    return { empId: empResult.recordset[0].EmpID };
};

exports.getPendingExcuses = async (managerId) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    
    const result = await request.query(`
        SELECT 
            ex.ExcuseID,
            ex.EmpID,
            e.Name as EmployeeName,
            ex.Type,
            ex.Reason,
            ex.ExcuseDate,
            ex.Duration,
            ex.SubmissionDate,
            CASE WHEN ex.AttachmentContent IS NOT NULL THEN 1 ELSE 0 END as HasAttachment
        FROM ExcuseTable ex
        JOIN EmpProfileTable e ON ex.EmpID = e.EmpID
        WHERE e.ManagerEmpID = @managerId 
        AND ex.Status = 'Pending'
        ORDER BY ex.SubmissionDate ASC
    `);
    
    return result.recordset;
};

exports.cancelExcuse = async (excuseId, empId) => {
    const request = pool.request();
    request.input('excuseId', sql.Int, excuseId);
    request.input('empId', sql.VarChar(30), empId);
    
    // Check if excuse can be cancelled
    const checkResult = await request.query(`
        SELECT Status FROM ExcuseTable 
        WHERE ExcuseID = @excuseId AND EmpID = @empId
    `);
    
    if (checkResult.recordset.length === 0) {
        throw new Error('Excuse request not found');
    }
    
    if (checkResult.recordset[0].Status !== 'Pending') {
        throw new Error('Only pending excuses can be cancelled');
    }
    
    await request.query(`
        UPDATE ExcuseTable 
        SET Status = 'Cancelled'
        WHERE ExcuseID = @excuseId AND EmpID = @empId
    `);
};

exports.getExcuseTypes = async () => {
    return [
        { id: 1, type: 'Late Arrival', description: 'Excuse for coming late to office' },
        { id: 2, type: 'Early Leave', description: 'Excuse for leaving office early' },
        { id: 3, type: 'Absence', description: 'Excuse for being absent from work' },
        { id: 4, type: 'Extended Break', description: 'Excuse for taking extended lunch/break' },
        { id: 5, type: 'Personal Emergency', description: 'Personal emergency during work hours' }
    ];
};

exports.getManagerId = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT ManagerEmpID FROM EmpProfileTable WHERE EmpID = @empId
    `);
    
    return result.recordset[0]?.ManagerEmpID;
};
