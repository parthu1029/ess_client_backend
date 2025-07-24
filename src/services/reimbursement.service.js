const { pool } = require('../config/database');
const sql = require('mssql');

exports.submitReimbursement = async (reimbursementData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), reimbursementData.empId);
    request.input('type', sql.VarChar(50), reimbursementData.type);
    request.input('amount', sql.Decimal(10, 2), reimbursementData.amount);
    request.input('comment', sql.VarChar(500), reimbursementData.comment);
    request.input('expenseDate', sql.Date, reimbursementData.expenseDate);
    request.input('status', sql.VarChar(15), 'Pending');
    
    // Handle receipt attachment
    if (reimbursementData.receiptData) {
        request.input('receiptContent', sql.VarBinary(sql.MAX), reimbursementData.receiptData.buffer);
        request.input('receiptFileName', sql.VarChar(200), reimbursementData.receiptData.fileName);
        request.input('receiptMimeType', sql.VarChar(100), reimbursementData.receiptData.mimeType);
        request.input('receiptSize', sql.Int, reimbursementData.receiptData.size);
    } else {
        request.input('receiptContent', sql.VarBinary(sql.MAX), null);
        request.input('receiptFileName', sql.VarChar(200), null);
        request.input('receiptMimeType', sql.VarChar(100), null);
        request.input('receiptSize', sql.Int, null);
    }
    
    const result = await request.query(`
        INSERT INTO ReimbursementTable 
        (EmpID, Type, Amount, Comment, ExpenseDate, Status, CreatedDate, 
         ReceiptContent, ReceiptFileName, ReceiptMimeType, ReceiptSize)
        VALUES 
        (@empId, @type, @amount, @comment, @expenseDate, @status, GETDATE(),
         @receiptContent, @receiptFileName, @receiptMimeType, @receiptSize);
        SELECT SCOPE_IDENTITY() as ReimbursementID;
    `);
    
    return result.recordset[0].ReimbursementID;
};

exports.getReimbursementHistory = async (empId, filters = {}) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    let query = `
        SELECT 
            ReimbursementID,
            Type,
            Amount,
            Comment,
            ExpenseDate,
            Status,
            CreatedDate,
            ProcessedDate,
            ManagerRemarks,
            CASE WHEN ReceiptContent IS NOT NULL THEN 1 ELSE 0 END as HasReceipt
        FROM ReimbursementTable
        WHERE EmpID = @empId
    `;
    
    if (filters.startDate) {
        request.input('startDate', sql.Date, filters.startDate);
        query += ` AND ExpenseDate >= @startDate`;
    }
    
    if (filters.endDate) {
        request.input('endDate', sql.Date, filters.endDate);
        query += ` AND ExpenseDate <= @endDate`;
    }
    
    if (filters.status) {
        request.input('status', sql.VarChar(15), filters.status);
        query += ` AND Status = @status`;
    }
    
    query += ` ORDER BY CreatedDate DESC`;
    
    const result = await request.query(query);
    return result.recordset;
};

exports.getReimbursementStatus = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            Status,
            COUNT(*) as Count,
            SUM(Amount) as TotalAmount
        FROM ReimbursementTable
        WHERE EmpID = @empId
        AND YEAR(CreatedDate) = YEAR(GETDATE())
        GROUP BY Status
    `);
    
    return result.recordset;
};

exports.approveRejectReimbursement = async (reimbursementId, action, remarks) => {
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    
    const request = pool.request();
    request.input('reimbursementId', sql.Int, reimbursementId);
    request.input('status', sql.VarChar(15), status);
    request.input('remarks', sql.VarChar(500), remarks);
    
    // Get employee ID for notification
    const empResult = await request.query(`
        SELECT EmpID FROM ReimbursementTable WHERE ReimbursementID = @reimbursementId
    `);
    
    await request.query(`
        UPDATE ReimbursementTable 
        SET Status = @status, 
            ManagerRemarks = @remarks,
            ProcessedDate = GETDATE()
        WHERE ReimbursementID = @reimbursementId
    `);
    
    return { empId: empResult.recordset[0].EmpID };
};

exports.getReimbursementTypes = async () => {
    const request = pool.request();
    
    const result = await request.query(`
        SELECT TypeID, TypeName, Description, MaxAmount, RequiresReceipt
        FROM ReimbursementTypeTable
        WHERE IsActive = 1
        ORDER BY TypeName
    `);
    
    return result.recordset;
};

exports.getPendingReimbursements = async (managerId) => {
    const request = pool.request();
    request.input('managerId', sql.VarChar(30), managerId);
    
    const result = await request.query(`
        SELECT 
            r.ReimbursementID,
            r.EmpID,
            e.Name as EmployeeName,
            r.Type,
            r.Amount,
            r.Comment,
            r.ExpenseDate,
            r.CreatedDate,
            CASE WHEN r.ReceiptContent IS NOT NULL THEN 1 ELSE 0 END as HasReceipt
        FROM ReimbursementTable r
        JOIN EmpProfileTable e ON r.EmpID = e.EmpID
        WHERE e.ManagerEmpID = @managerId 
        AND r.Status = 'Pending'
        ORDER BY r.CreatedDate ASC
    `);
    
    return result.recordset;
};

exports.cancelReimbursement = async (reimbursementId, empId) => {
    const request = pool.request();
    request.input('reimbursementId', sql.Int, reimbursementId);
    request.input('empId', sql.VarChar(30), empId);
    
    // Check if reimbursement can be cancelled
    const checkResult = await request.query(`
        SELECT Status FROM ReimbursementTable 
        WHERE ReimbursementID = @reimbursementId AND EmpID = @empId
    `);
    
    if (checkResult.recordset.length === 0) {
        throw new Error('Reimbursement request not found');
    }
    
    if (checkResult.recordset[0].Status !== 'Pending') {
        throw new Error('Only pending reimbursements can be cancelled');
    }
    
    await request.query(`
        UPDATE ReimbursementTable 
        SET Status = 'Cancelled'
        WHERE ReimbursementID = @reimbursementId AND EmpID = @empId
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
