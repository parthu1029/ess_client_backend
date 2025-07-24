const { pool } = require('../config/database');
const sql = require('mssql');

exports.checkIn = async (empId) => {
    const checkInTime = new Date();
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('checkInTime', sql.DateTime, checkInTime);
    
    await request.query(`
        INSERT INTO AttendanceTable (EmpID, CheckInTime, Date)
        VALUES (@empId, @checkInTime, CAST(GETDATE() AS DATE))
    `);
    
    return { time: checkInTime };
};

exports.checkOut = async (empId) => {
    const checkOutTime = new Date();
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('checkOutTime', sql.DateTime, checkOutTime);
    
    await request.query(`
        UPDATE AttendanceTable 
        SET CheckOutTime = @checkOutTime,
            WorkingHours = DATEDIFF(HOUR, CheckInTime, @checkOutTime)
        WHERE EmpID = @empId AND Date = CAST(GETDATE() AS DATE)
    `);
    
    return { time: checkOutTime };
};

exports.getDailyStatus = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT CheckInTime, CheckOutTime, WorkingHours, Status
        FROM AttendanceTable
        WHERE EmpID = @empId AND Date = CAST(GETDATE() AS DATE)
    `);
    
    return result.recordset[0] || { status: 'Not checked in' };
};

exports.getMonthlySummary = async (empId, filters = {}) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('month', sql.Int, filters.month || new Date().getMonth() + 1);
    request.input('year', sql.Int, filters.year || new Date().getFullYear());
    
    const result = await request.query(`
        SELECT 
            COUNT(*) as TotalDays,
            COUNT(CASE WHEN CheckInTime IS NOT NULL THEN 1 END) as PresentDays,
            COUNT(CASE WHEN CheckInTime IS NULL THEN 1 END) as AbsentDays,
            COUNT(CASE WHEN DATEPART(HOUR, CheckInTime) > 9 THEN 1 END) as LateDays,
            SUM(WorkingHours) as TotalWorkingHours,
            AVG(WorkingHours) as AvgWorkingHours
        FROM AttendanceTable
        WHERE EmpID = @empId 
        AND MONTH(Date) = @month 
        AND YEAR(Date) = @year
    `);
    
    return result.recordset[0];
};

exports.updateAttendance = async (empId, attendanceData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('date', sql.Date, attendanceData.date);
    request.input('checkInTime', sql.DateTime, attendanceData.checkInTime);
    request.input('checkOutTime', sql.DateTime, attendanceData.checkOutTime);
    request.input('workingHours', sql.Int, attendanceData.workingHours);
    
    await request.query(`
        UPDATE AttendanceTable 
        SET CheckInTime = @checkInTime,
            CheckOutTime = @checkOutTime,
            WorkingHours = @workingHours
        WHERE EmpID = @empId AND Date = @date
    `);
};


exports.getAttendanceHistory = async (empId, filters = {}) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('month', sql.Int, filters.month || new Date().getMonth() + 1);
    request.input('year', sql.Int, filters.year || new Date().getFullYear());
    
    const result = await request.query(`
        SELECT Date, CheckInTime, CheckOutTime, WorkingHours, Status
        FROM AttendanceTable
        WHERE EmpID = @empId 
        AND MONTH(Date) = @month 
        AND YEAR(Date) = @year
        ORDER BY Date DESC
    `);
    
    return result.recordset;
};
