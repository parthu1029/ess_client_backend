const leaveService = require('../services/leave.service');

// Apply/submit a new leave request
exports.applyLeave = async (req, res) => {
  try {
    const result = await leaveService.applyLeave(
      req.body,
      req.file?.buffer,
      req.cookies.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: "Leave request submitted", LeaveReqID: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leave history for an employee
exports.getLeaveHistory = async (req, res) => {
  try {
    const history = await leaveService.getLeaveHistory(
      req.cookies.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leave types from all existing requests (unique values)
exports.getLeaveTypes = async (req, res) => {
  try {
    const types = await leaveService.getLeaveTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel a leave request
exports.cancelLeave = async (req, res) => {
  try {
    await leaveService.cancelLeave(req.headers['leavereqid']);
    res.json({ message: "Leave cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject leave
exports.approveRejectLeave = async (req, res) => {
  try {
    await leaveService.approveRejectLeave(req.body.LeaveReqID, req.body.action);
    res.json({ message: `Leave request ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending leaves for an EmpID
exports.getPendingLeaves = async (req, res) => {
  try {
    const pending = await leaveService.getPendingLeaves(
      req.cookies.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID
    );
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one leave by ID
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await leaveService.getLeaveById(req.headers['leavereqid']);
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update leave request
exports.updateLeave = async (req, res) => {
  try {
    await leaveService.updateLeave(req.body.LeaveReqID, req.body);
    res.json({ message: "Leave request updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Transaction log — not modeled, return []
exports.getLeaveRequestTransactions = async (req, res) => {
  res.json([]);
};

// Get all requests for an employee
exports.getLeaveRequestDetails = async (req, res) => {
  try {
    const details = await leaveService.getLeaveRequestDetails(
      req.cookies.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Synonyms for submit/apply
exports.submitLeave = exports.applyLeave;
exports.submitLeaveOnBehalf = async (req, res) => {
  try {
    const result = await leaveService.applyLeave(
      req.body,
      req.file?.buffer,
      req.body.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: "Leave request submitted", LeaveReqID: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a request
exports.editLeaveRequest = async (req, res) => {
  try {
    await leaveService.editLeaveRequest(req.body.LeaveReqID, req.body);
    res.json({ message: "Leave request edited" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save as draft
exports.draftSaveLeaveRequest = async (req, res) => {
  try {
    const LeaveReqID = await leaveService.draftSaveLeaveRequest(
      req.body,
      req.file?.buffer,
      req.cookies.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: "Leave draft saved", LeaveReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingLeaveRequestDetails = async (req, res) => {
  try {
    const detail = await leaveService.getPendingLeaveRequestDetails(req.headers['leavereqid']);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH approve/reject
exports.approveRejectLeaveRequest = async (req, res) => {
  try {
    await leaveService.approveRejectLeave(req.body.LeaveReqID, req.body.action);
    res.json({ message: `Leave ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeLeaveRequestApproval = async (req, res) => {
  try {
    await leaveService.changeLeaveRequestApproval(req.body.LeaveReqID, req.body.status);
    res.json({ message: "Leave approval status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate leave approval
exports.delegateLeaveApproval = async (req, res) => {
  try {
    const { requestID, newApproverEmpID, Comment } = req.body;
    await leaveService.delegateLeaveApproval(requestID, newApproverEmpID, Comment);
    res.json({ message: 'Leave approval delegated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
