const documentService = require('../services/document.service');

// Get all documents
exports.getAllDocuments = async (req, res) => {
  try {
    const docs = await documentService.getAllDocuments();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.query;
    const doc = await documentService.getDocumentById(id);
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download document (send file as attachment)
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.query;
    const file = await documentService.downloadDocument(id);
    if (file) {
      res.set({
        'Content-Type': file.ContentType,
        'Content-Disposition': `attachment; filename="${file.FileName}"`,
      });
      res.send(file.FileData);
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload new document
exports.uploadDocument = async (req, res) => {
  try {
    const { originalname, mimetype, buffer } = req.file;
    const metadata = req.body; // other metadata like uploadedBy, description, etc.
    await documentService.uploadDocument({
      FileName: originalname,
      ContentType: mimetype,
      FileData: buffer,
      ...metadata,
    });
    res.json({ message: 'Document uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update document metadata by ID
exports.updateDocumentMetadata = async (req, res) => {
  try {
    const data = req.body; // should contain id and fields to update
    await documentService.updateDocumentMetadata(data);
    res.json({ message: 'Document metadata updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete document by ID
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.query;
    await documentService.deleteDocument(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get document transactions (e.g., logs/history)
exports.getDocumentTransactions = async (req, res) => {
  try {
    const { DocID } = req.query;
    const transactions = await documentService.getDocumentTransactions(DocID);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get document request details for user
exports.getDocumentRequestDetails = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const details = await documentService.getDocumentRequestDetails(EmpID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit new document request
exports.submitDocumentRequest = async (req, res) => {
  try {
    const data = req.body;
    await documentService.submitDocumentRequest(data);
    res.json({ message: 'Document request submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit document request on behalf of another employee
exports.submitDocumentRequestOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    await documentService.submitDocumentRequestOnBehalf(data);
    res.json({ message: 'Document request submitted on behalf' });
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
    await documentService.draftSaveDocumentRequest(data);
    res.json({ message: 'Document request draft saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate document approval
exports.delegateDocumentApproval = async (req, res) => {
  try {
    const { requestId, newApproverEmpID } = req.body;
    await documentService.delegateDocumentApproval(requestId, newApproverEmpID);
    res.json({ message: 'Document approval delegated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change document approval status
exports.changeDocumentApproval = async (req, res) => {
  try {
    const { requestId, approvalStatus } = req.body;
    await documentService.changeDocumentApproval(requestId, approvalStatus);
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
    const { ApproverEmpID } = req.query;
    const pendingRequests = await documentService.getPendingDocumentRequests(ApproverEmpID);
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get details for a pending document request
exports.getPendingDocumentRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.query;
    const details = await documentService.getPendingDocumentRequestDetails(requestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
