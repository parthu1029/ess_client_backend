const { pool } = require('../config/database');
const sql = require('mssql');

exports.getPayslip = async (empId, period) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('month', sql.Int, period.month || new Date().getMonth() + 1);
    request.input('year', sql.Int, period.year || new Date().getFullYear());
    
    const result = await request.query(`
        SELECT 
            p.*,
            e.Name,
            e.Position,
            e.Grade,
            e.BankAccountNo,
            e.BankName,
            e.IFSCCode
        FROM PayslipTable p
        JOIN EmpProfileTable e ON p.EmpID = e.EmpID
        WHERE p.EmpID = @empId 
        AND MONTH(p.Period) = @month 
        AND YEAR(p.Period) = @year
    `);
    
    return result.recordset[0];
};

exports.getPayslipHistory = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT Period, CreatedDate, NetSalary, BaseSalary
        FROM PayslipTable 
        WHERE EmpID = @empId
        ORDER BY Period DESC
    `);
    
    return result.recordset;
};

exports.updateBankDetails = async (empId, bankDetails) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('bankName', sql.VarChar(100), bankDetails.bankName);
    request.input('accountNo', sql.VarChar(20), bankDetails.accountNo);
    request.input('ifscCode', sql.VarChar(15), bankDetails.ifscCode);
    
    await request.query(`
        UPDATE EmpProfileTable 
        SET BankName = @bankName,
            BankAccountNo = @accountNo,
            IFSCCode = @ifscCode
        WHERE EmpID = @empId
    `);
};
