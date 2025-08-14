const excuseService = require('../services/excuse.service');

// Submit new excuse with optional attachment
exports.submitExcuseRequest = async (req, res) => {
  try {
    const data = req.body;
    const ExcuseReqID = await excuseService.submitExcuseRequest(
      data,
      req.file?.buffer,
      req.cookies.empid,
      req.cookies.context.companyid,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: 'Excuse submitted successfully', ExcuseReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel an excuse request by ID
exports.cancelExcuse = async (req, res) => {
  try {
    const excuseId = req.headers['reqid'];
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

// Get transaction history/logs for an excuse
exports.getExcuseTransactions = async (req, res) => {
  try {
    const transactions = await excuseService.getExcuseTransactions(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get detailed excuse request info for an employee
exports.getExcuseRequestDetails = async (req, res) => {
  try {
    const ReqID = req.headers['reqid'];
    const details = await excuseService.getExcuseRequestDetails(ReqID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit excuse on behalf of another employee
exports.submitExcuseOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    const ExcuseReqID = await excuseService.submitExcuseOnBehalf(
      data,
      req.file?.buffer,
      req.body.empid,
      req.cookies.context.companyid,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: 'Excuse submitted on behalf successfully', ExcuseReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit (patch) an excuse request
exports.editExcuseRequest = async (req, res) => {
  try {
    const { reqid: requestId, ...updateData } = req.body;
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
    const ExcuseReqID = await excuseService.draftSaveExcuseRequest(
      data,
      req.file?.buffer,
      req.cookies.empid,
      req.cookies.context.companyid,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: 'Excuse request draft saved', ExcuseReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending excuse requests (possibly duplicates in routes - handled here)
exports.getPendingExcuseRequests = async (req, res) => {
  try {
    const ApproverEmpID = req.cookies.empid;
    const pending = await excuseService.getPendingExcuseRequests(
      ApproverEmpID,
      req.cookies.context.companyid
    );
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get detailed info for a pending excuse request
exports.getPendingExcuseRequestDetails = async (req, res) => {
  try {
    const requestId = req.headers['reqid'];
    const details = await excuseService.getPendingExcuseRequestDetails(requestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject excuse request (PATCH)
exports.approveRejectExcuseRequest = async (req, res) => {
  try {
    const { reqid: requestId, action, comments } = req.body;
    await excuseService.approveRejectExcuse(requestId, action, comments);
    res.json({ message: `Excuse request ${action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change excuse approval status
exports.changeExcuseApproval = async (req, res) => {
  try {
    const { reqid: requestId, approvalStatus } = req.body;
    await excuseService.changeExcuseApproval(requestId, approvalStatus);
    res.json({ message: 'Excuse approval status changed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate excuse approval to another approver
exports.delegateExcuseApproval = async (req, res) => {
  try {
    const { reqid: requestId, newApproverEmpID } = req.body;
    await excuseService.delegateExcuseApproval(requestId, newApproverEmpID);
    res.json({ message: 'Excuse approval delegated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
