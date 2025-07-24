const { pool } = require('../config/database');
const sql = require('mssql');

exports.uploadDocument = async (empId, documentData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('type', sql.VarChar(50), documentData.type);
    request.input('fileName', sql.VarChar(200), documentData.fileName);
    request.input('fileContent', sql.VarBinary(sql.MAX), documentData.fileBuffer); // Store as BLOB
    request.input('fileSize', sql.Int, documentData.fileSize);
    request.input('mimeType', sql.VarChar(100), documentData.mimeType);
    
    const result = await request.query(`
        INSERT INTO DocumentTable (EmpID, DocumentType, FileName, FileContent, FileSize, MimeType, UploadDate)
        VALUES (@empId, @type, @fileName, @fileContent, @fileSize, @mimeType, GETDATE());
        SELECT SCOPE_IDENTITY() as DocumentID;
    `);
    
    return result.recordset[0].DocumentID;
};

exports.getAllDocuments = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT DocumentID, DocumentType, FileName, FileSize, MimeType, UploadDate
        FROM DocumentTable
        WHERE EmpID = @empId
        ORDER BY UploadDate DESC
    `);
    
    return result.recordset;
};

exports.getDocument = async (empId, docId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('docId', sql.Int, docId);
    
    const result = await request.query(`
        SELECT DocumentID, DocumentType, FileName, FileContent, FileSize, MimeType
        FROM DocumentTable
        WHERE DocumentID = @docId AND EmpID = @empId
    `);
    
    return result.recordset[0] || null;
};

exports.deleteDocument = async (empId, docId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('docId', sql.Int, docId);
    
    // Simply delete from database - no file system cleanup needed
    const result = await request.query(`
        DELETE FROM DocumentTable 
        WHERE DocumentID = @docId AND EmpID = @empId
    `);
    
    return result.rowsAffected[0] > 0;
};

exports.downloadDocument = async (empId, docId) => {
    const document = await this.getDocument(empId, docId);
    
    if (!document) {
        throw new Error('Document not found');
    }
    
    return {
        fileName: document.FileName,
        fileContent: document.FileContent,
        mimeType: document.MimeType,
        fileSize: document.FileSize
    };
};
