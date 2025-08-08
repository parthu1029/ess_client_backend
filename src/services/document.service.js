const sql = require('mssql');
const dbConfig = require('../config/db.config');


// Get document request by DocumentReqID (metadata only)
async function getDocumentRequestDetails(DocumentReqID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .query('SELECT * FROM DocumentReqTable WHERE documentReqID=@DocumentReqID');
  return result.recordset[0];
}


// Create a new document request
async function submitDocumentRequest(data,EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .query('SELECT managerID FROM EmpProfileTable WHERE empID = @EmpID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerID;

  // Insert document request with approverEmpID
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), data.DocumentReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqDate', sql.Date, data.ReqDate || new Date())
    .input('Status', sql.VarChar(15), data.Status || 'Pending')
    .input('approverEmpID', sql.VarChar(30), managerID)
    .input('Type', sql.VarChar(20), data.Type)
    .input('Reason', sql.VarChar(100), data.Reason || null)
    .query(`
      INSERT INTO DocumentReqTable
      (documentReqID, EmpID, CompanyID, ReqDate, Status, approverEmpID, Type, Reason)
      VALUES
      (@DocumentReqID, @EmpID, @CompanyID, @ReqDate, @Status, @approverEmpID, @Type, @Reason)
    `);
}

// Submit document request on behalf of another employee (just set EmpID as required)
async function submitDocumentRequestOnBehalf(data,EmpID,CompanyID) {
  return submitDocumentRequest(data,EmpID,CompanyID); // Logic is the same
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
      WHERE documentReqID=@DocumentReqID
    `);
}

// Draft save document request (Status='Draft')
async function draftSaveDocumentRequest(data,EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), data.DocumentReqID)
    .input('EmpID', sql.VarChar(30), data.EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqDate', sql.Date, data.ReqDate || new Date())
    .input('Status', sql.VarChar(15), 'Draft')
    .input('Type', sql.VarChar(20), data.Type)
    .input('Reason', sql.VarChar(100), data.Reason)
    .query(`
      INSERT INTO DocumentReqTable
      (documentReqID, EmpID, CompanyID, ReqDate, Status, Type, Reason)
      VALUES
      (@DocumentReqID, @EmpID, @CompanyID, @ReqDate, @Status, @Type, @Reason)
    `);
}

// Change approval (status)
async function changeDocumentApproval(DocumentReqID, approvalStatus) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .input('Status', sql.VarChar(15), approvalStatus)
    .query('UPDATE DocumentReqTable SET Status=@Status WHERE documentReqID=@DocumentReqID');
}

// Approve or reject document request
async function approveRejectDocumentRequest(DocumentReqID, action) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .input('Status', sql.VarChar(15), action === 'approve' ? 'Approved' : 'Rejected')
    .query('UPDATE DocumentReqTable SET Status=@Status WHERE documentReqID=@DocumentReqID');
}


// Get all document requests for an employee
async function getDocumentRequestTransactions(EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM DocumentReqTable WHERE EmpID=@EmpID AND companyID=@CompanyID ORDER BY ReqDate DESC');
  return result.recordset;
}

// Get pending requests for an employee (status = 'Pending')
async function getPendingDocumentRequests(EmpID,CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM DocumentReqTable WHERE Status=\'Pending\' AND approverEmpID=@EmpID AND companyID=@CompanyID ORDER BY ReqDate DESC');
  return result.recordset;
}

// Get details for a specific pending request
async function getPendingDocumentRequestDetails(DocumentReqID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .query('SELECT * FROM DocumentReqTable WHERE documentReqID=@DocumentReqID');
  return result.recordset[0];
}

// Delete document request by ID
async function delegateDocumentApproval(DocumentReqID, newApproverEmpID, actorEmpID, comments = null) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('DocumentReqID', sql.VarChar(30), DocumentReqID)
    .input('approverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE DocumentReqTable SET approverEmpID=@approverEmpID WHERE documentReqID=@DocumentReqID');
  
  // Log delegation in timeline
    const timelineID = generateAttachmentID();
    await pool.request()
      .input('timelineID', sql.VarChar(30), timelineID)
      .input('reqID', sql.VarChar(30), DocumentReqID)
      .input('action', sql.VarChar(50), 'Delegated')
      .input('actorEmpID', sql.VarChar(30), actorEmpID)
      .input('comments', sql.VarChar(500), comments)
      .input('actionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO ReqTimelineTable
          (timelineID, reqID, action, actorEmpID, comments, actionDate)
        VALUES
          (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
      `);
}

async function deleteDocument(DocumentReqID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('documentReqID', sql.VarChar(30), DocumentReqID)
    .query('DELETE FROM DocumentReqTable WHERE documentReqID=@documentReqID');
}

module.exports = {
  deleteDocument,
  submitDocumentRequest,
  submitDocumentRequestOnBehalf,
  editDocumentRequest,
  draftSaveDocumentRequest,
  changeDocumentApproval,
  approveRejectDocumentRequest,
  delegateDocumentApproval,
  getDocumentRequestTransactions,
  getDocumentRequestDetails,
  getPendingDocumentRequests,
  getPendingDocumentRequestDetails,
};
