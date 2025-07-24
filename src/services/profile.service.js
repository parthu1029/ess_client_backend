const { pool } = require('../config/database');
const sql = require('mssql');

exports.getProfileById = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT EmpID, Name, DOB, DOJ, Position, Grade, ManagerEmpID, 
               Phone, Address, Email, PhotoFileName, PhotoMimeType,
               CASE WHEN PhotoContent IS NOT NULL THEN 1 ELSE 0 END as HasPhoto
        FROM EmpProfileTable 
        WHERE EmpID = @empId
    `);
    
    return result.recordset[0] || null;
};

exports.updateProfile = async (empId, updateData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const updateFields = [];
    if (updateData.phone) {
        request.input('phone', sql.VarChar(15), updateData.phone);
        updateFields.push('Phone = @phone');
    }
    if (updateData.address) {
        request.input('address', sql.VarChar(200), updateData.address);
        updateFields.push('Address = @address');
    }
    if (updateData.email) {
        request.input('email', sql.VarChar(100), updateData.email);
        updateFields.push('Email = @email');
    }
    
    if (updateFields.length > 0) {
        await request.query(`
            UPDATE EmpProfileTable 
            SET ${updateFields.join(', ')}
            WHERE EmpID = @empId
        `);
    }
};

// Updated to store photo as BLOB
exports.uploadPhoto = async (empId, photoData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('photoContent', sql.VarBinary(sql.MAX), photoData.buffer);
    request.input('photoFileName', sql.VarChar(200), photoData.fileName);
    request.input('photoMimeType', sql.VarChar(100), photoData.mimeType);
    request.input('photoSize', sql.Int, photoData.size);
    
    await request.query(`
        UPDATE EmpProfileTable 
        SET PhotoContent = @photoContent,
            PhotoFileName = @photoFileName,
            PhotoMimeType = @photoMimeType,
            PhotoSize = @photoSize,
            PhotoUploadDate = GETDATE()
        WHERE EmpID = @empId
    `);
};

// Updated to return photo BLOB data
exports.getPhoto = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT PhotoContent, PhotoFileName, PhotoMimeType, PhotoSize
        FROM EmpProfileTable 
        WHERE EmpID = @empId AND PhotoContent IS NOT NULL
    `);
    
    return result.recordset[0] || null;
};

exports.deletePhoto = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    await request.query(`
        UPDATE EmpProfileTable 
        SET PhotoContent = NULL,
            PhotoFileName = NULL,
            PhotoMimeType = NULL,
            PhotoSize = NULL,
            PhotoUploadDate = NULL
        WHERE EmpID = @empId
    `);
};

exports.getEmploymentSummary = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            e.EmpID,
            e.Name,
            e.Position,
            e.Grade,
            e.DOJ,
            m.Name as ManagerName,
            e.ManagerEmpID,
            CASE WHEN e.PhotoContent IS NOT NULL THEN 1 ELSE 0 END as HasPhoto
        FROM EmpProfileTable e
        LEFT JOIN EmpProfileTable m ON e.ManagerEmpID = m.EmpID
        WHERE e.EmpID = @empId
    `);
    
    return result.recordset[0];
};
