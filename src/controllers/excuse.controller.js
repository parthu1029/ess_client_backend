const excuseService = require('../services/excuse.service');

// Submit new excuse with optional attachment
exports.submitExcuse = async (req, res) => {
  try {
    const { originalname, mimetype, buffer } = req.file || {};
    const data = req.body;
    const attachment = req.file ? { fileName: originalname, contentType: mimetype, fileData: buffer } : null;

    await excuseService.submitExcuse(data, attachment);
    res.json({ message: 'Excuse submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get excuse history for an employee
exports.getExcuseHistory = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const history = await excuseService.getExcuseHistory(EmpID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get status of an excuse by ID or for an employee
exports.getExcuseStatus = async (req, res) => {
  try {
    const { excuseId, EmpID } = req.query;
    const status = excuseId ? 
      await excuseService.getExcuseStatusById(excuseId) :
      await excuseService.getExcuseStatusForEmp(EmpID);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject an excuse (action)
exports.approveRejectExcuse = async (req, res) => {
  try {
    const { excuseId, action, comments } = req.body; // action: 'approve' or 'reject'
    await excuseService.approveRejectExcuse(excuseId, action, comments);
    res.json({ message: `Excuse ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending excuses for approval
exports.getPendingExcuses = async (req, res) => {
  try {
    const { ApproverEmpID } = req.query;
    const pending = await excuseService.getPendingExcuses(ApproverEmpID);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel an excuse request by ID
exports.cancelExcuse = async (req, res) => {
  try {
    const { excuseId } = req.query;
    await excuseService.cancelExcuse(excuseId);
    res.json({ message: 'Excuse cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get list of excuse types
exports.getExcuseTypes = async (req, res) => {
  try {
    const types = await excuseService.getExcuseTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get excuse by ID, including metadata
exports.getExcuseById = async (req, res) => {
  try {
    const { id } = req.query;
    const excuse = await excuseService.getExcuseById(id);
    if (excuse) {
      res.json(excuse);
    } else {
      res.status(404).json({ error: 'Excuse not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download excuse attachment file
exports.downloadExcuseAttachment = async (req, res) => {
  try {
    const { excuseId } = req.query;
    const attachment = await excuseService.downloadExcuseAttachment(excuseId);
    if (attachment) {
      res.set({
        'Content-Type': attachment.ContentType,
        'Content-Disposition': `attachment; filename="${attachment.FileName}"`,
      });
      res.send(attachment.FileData);
    } else {
      res.status(404).json({ error: 'Attachment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get transaction history/logs for an excuse
exports.getExcuseTransactions = async (req, res) => {
  try {
    const { excuseId } = req.query;
    const transactions = await excuseService.getExcuseTransactions(excuseId);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get detailed excuse request info for an employee
exports.getExcuseRequestDetails = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const details = await excuseService.getExcuseRequestDetails(EmpID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit excuse on behalf of another employee
exports.submitExcuseOnBehalf = async (req, res) => {
  try {
    const { originalname, mimetype, buffer } = req.file || {};
    const data = req.body;
    const attachment = req.file ? { fileName: originalname, contentType: mimetype, fileData: buffer } : null;

    await excuseService.submitExcuseOnBehalf(data, attachment);
    res.json({ message: 'Excuse submitted on behalf successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit (patch) an excuse request
exports.editExcuseRequest = async (req, res) => {
  try {
    const { requestId, ...updateData } = req.body;
    await excuseService.editExcuseRequest(requestId, updateData);
    res.json({ message: 'Excuse request updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save excuse request draft
exports.draftSaveExcuseRequest = async (req, res) => {
  try {
    const data = req.body;
    await excuseService.draftSaveExcuseRequest(data);
    res.json({ message: 'Excuse request draft saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending excuse requests (possibly duplicates in routes - handled here)
exports.getPendingExcuseRequests = async (req, res) => {
  try {
    const { ApproverEmpID } = req.query;
    const pending = await excuseService.getPendingExcuseRequests(ApproverEmpID);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get detailed info for a pending excuse request
exports.getPendingExcuseRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.query;
    const details = await excuseService.getPendingExcuseRequestDetails(requestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject excuse request (PATCH)
exports.approveRejectExcuseRequest = async (req, res) => {
  try {
    const { requestId, action, comments } = req.body;
    await excuseService.approveRejectExcuseRequest(requestId, action, comments);
    res.json({ message: `Excuse request ${action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change excuse approval status
exports.changeExcuseApproval = async (req, res) => {
  try {
    const { requestId, approvalStatus } = req.body;
    await excuseService.changeExcuseApproval(requestId, approvalStatus);
    res.json({ message: 'Excuse approval status changed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate excuse approval to another approver
exports.delegateExcuseApproval = async (req, res) => {
  try {
    const { requestId, newApproverEmpID } = req.body;
    await excuseService.delegateExcuseApproval(requestId, newApproverEmpID);
    res.json({ message: 'Excuse approval delegated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
