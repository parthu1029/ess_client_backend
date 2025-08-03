const sql = require('mssql');
const dbConfig = require('../config/db.config');

// ========== DOCUMENT REQUESTS ==========

// Get all document requests
async function getAllDocuments() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .query('SELECT * FROM DocumentReqTable ORDER BY ReqDate DESC');
  return result.recordset;
}

// Get document request by DocumentReqID (metadata only)
async function getDocumentById(DocumentReqID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .query('SELECT * FROM DocumentReqTable WHERE DocumentReqID=@DocumentReqID');
  return result.recordset[0];
}

// There is no file attachment/BLOB in the table for download—so skip that API

// Create a new document request
async function submitDocumentRequest(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), data.DocumentReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('ReqDate', sql.Date, data.ReqDate || new Date())
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('Type', sql.VarChar(20), data.Type)
    .input('Reason', sql.VarChar(100), data.Reason || null)
    .query(`
      INSERT INTO DocumentReqTable
      (DocumentReqID, EmpID, ReqDate, Status, Type, Reason)
      VALUES
      (@DocumentReqID, @EmpID, @ReqDate, @Status, @Type, @Reason)
    `);
}

// Submit document request on behalf of another employee (just set EmpID as required)
async function submitDocumentRequestOnBehalf(data) {
  return submitDocumentRequest(data); // Logic is the same
}

// Edit (patch) a document request
async function editDocumentRequest(DocumentReqID, updateData) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .input('Type', sql.VarChar(20), updateData.Type)
    .input('Reason', sql.VarChar(100), updateData.Reason)
    .query(`
      UPDATE DocumentReqTable
      SET Type=@Type, Reason=@Reason
      WHERE DocumentReqID=@DocumentReqID
    `);
}

// Draft save document request (Status='Draft')
async function draftSaveDocumentRequest(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), data.DocumentReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('ReqDate', sql.Date, data.ReqDate || new Date())
    .input('Status', sql.VarChar(15), 'Draft')
    .input('Type', sql.VarChar(20), data.Type)
    .input('Reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO DocumentReqTable
      (DocumentReqID, EmpID, ReqDate, Status, Type, Reason)
      VALUES
      (@DocumentReqID, @EmpID, @ReqDate, @Status, @Type, @Reason)
    `);
}

// Change approval (status)
async function changeDocumentApproval(DocumentReqID, approvalStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .input('Status', sql.VarChar(15), approvalStatus)
    .query('UPDATE DocumentReqTable SET Status=@Status WHERE DocumentReqID=@DocumentReqID');
}

// Approve or reject document request
async function approveRejectDocumentRequest(DocumentReqID, action) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
    .query('UPDATE DocumentReqTable SET Status=@Status WHERE DocumentReqID=@DocumentReqID');
}

// Delegate approval (if you have such logic, you might set a delegated ApproverEmpID, but not present in your ERD)
// This could be extended if you add an ApproverEmpID column

// Get all document transactions—NOT in your ERD, so return empty array
async function getDocumentTransactions(DocumentReqID) {
  return [];
}

// Get all document requests for an employee
async function getDocumentRequestDetails(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM DocumentReqTable WHERE EmpID=@EmpID ORDER BY ReqDate DESC');
  return result.recordset;
}

// Get pending requests for an employee (status = 'Pending')
async function getPendingDocumentRequests(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query('SELECT * FROM DocumentReqTable WHERE Status=\'Pending\' AND EmpID=@EmpID ORDER BY ReqDate DESC');
  return result.recordset;
}

// Get details for a specific pending request
async function getPendingDocumentRequestDetails(DocumentReqID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .query('SELECT * FROM DocumentReqTable WHERE DocumentReqID=@DocumentReqID');
  return result.recordset[0];
}

// Delete document request by ID
async function deleteDocument(DocumentReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .query('DELETE FROM DocumentReqTable WHERE DocumentReqID=@DocumentReqID');
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  submitDocumentRequest,
  submitDocumentRequestOnBehalf,
  editDocumentRequest,
  draftSaveDocumentRequest,
  changeDocumentApproval,
  approveRejectDocumentRequest,
  getDocumentTransactions,
  getDocumentRequestDetails,
  getPendingDocumentRequests,
  getPendingDocumentRequestDetails,
};
