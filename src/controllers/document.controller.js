const documentService = require('../services/document.service');

// Delete document by ID
exports.deleteDocument = async (req, res) => {
  try {
    const id = req.headers['id'];
    await documentService.deleteDocument(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get document transactions
exports.getDocumentTransactions = async (req, res) => {
  try {
    const EmpID = req.cookies.EmpID;
    const CompanyID = req.cookies.context.CompanyID;
    const transactions = await documentService.getDocumentRequestTransactions(EmpID,CompanyID);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get document request details for user
exports.getDocumentRequestDetails = async (req, res) => {
  try {
    const reqID = req.headers['reqid'];
    const details = await documentService.getDocumentRequestDetails(reqID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit new document request
exports.submitDocumentRequest = async (req, res) => {
  try {
    const data = req.body;
    const DocumentReqID = await documentService.submitDocumentRequest(
      data,
      req.cookies.EmpID,
      req.cookies.context.CompanyID
    );
    res.json({ message: 'Document request submitted', DocumentReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit document request on behalf of another employee
exports.submitDocumentRequestOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    const DocumentReqID = await documentService.submitDocumentRequestOnBehalf(
      data,
      req.body.EmpID,
      req.cookies.context.CompanyID
    );
    res.json({ message: 'Document request submitted on behalf', DocumentReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit (patch) document request
exports.editDocumentRequest = async (req, res) => {
  try {
    const { requestId, ...updateData } = req.body;
    await documentService.editDocumentRequest(requestId, updateData);
    res.json({ message: 'Document request updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Draft save document request
exports.draftSaveDocumentRequest = async (req, res) => {
  try {
    const data = req.body;
    const DocumentReqID = await documentService.draftSaveDocumentRequest(
      data,
      req.cookies.EmpID,
      req.cookies.context.CompanyID
    );
    res.json({ message: 'Document request draft saved', DocumentReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate document approval
exports.delegateDocumentApproval = async (req, res) => {
  try {
    const { requestID, newApproverEmpID, comments = null } = req.body;
    await documentService.delegateDocumentApproval(requestID, newApproverEmpID, comments);
    res.json({ message: 'Document approval delegated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change document approval status
exports.changeDocumentApproval = async (req, res) => {
  try {
    const { requestID } = req.body;
    await documentService.changeDocumentApproval(requestID);
    res.json({ message: 'Document approval status changed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject document request
exports.approveRejectDocumentRequest = async (req, res) => {
  try {
    const { requestId, action, comments } = req.body; // action='approve' or 'reject'
    await documentService.approveRejectDocumentRequest(requestId, action, comments);
    res.json({ message: `Document request ${action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending document requests for approver
exports.getPendingDocumentRequests = async (req, res) => {
  try {
    const pendingRequests = await documentService.getPendingDocumentRequests(req.cookies.EmpID, req.cookies.context.CompanyID);
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get details for a pending document request
exports.getPendingDocumentRequestDetails = async (req, res) => {
  try {
    const requestId = req.headers['requestid'];
    const details = await documentService.getPendingDocumentRequestDetails(requestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
