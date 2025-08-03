const reimbursementService = require('../services/reimbursement.service');

// Submit a reimbursement (with receipt upload)
exports.submitReimbursement = async (req, res) => {
  try {
    await reimbursementService.submitReimbursement(req.body, req.file?.buffer);
    res.json({ message: "Reimbursement request submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementHistory = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const history = await reimbursementService.getReimbursementHistory(EmpID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementStatus = async (req, res) => {
  try {
    const { ReimbursementID } = req.query;
    const status = await reimbursementService.getReimbursementStatus(ReimbursementID);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveRejectReimbursement = async (req, res) => {
  try {
    await reimbursementService.approveRejectReimbursement(req.body.ReimbursementID, req.body.action);
    res.json({ message: `Reimbursement request ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementTypes = async (req, res) => {
  try {
    const types = await reimbursementService.getReimbursementTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingReimbursements = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const pending = await reimbursementService.getPendingReimbursements(EmpID);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelReimbursement = async (req, res) => {
  try {
    await reimbursementService.cancelReimbursement(req.query.ReimbursementID);
    res.json({ message: "Reimbursement request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementById = async (req, res) => {
  try {
    const { ReimbursementID } = req.query;
    const result = await reimbursementService.getReimbursementById(ReimbursementID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const { ReimbursementID } = req.query;
    const buffer = await reimbursementService.downloadReceipt(ReimbursementID);
    if (buffer) {
      res.set('Content-Type', 'application/pdf');
      res.send(buffer);
    } else {
      res.status(404).json({ error: "Receipt not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Counts and totals for an employee
exports.getReimbursementSummary = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const summary = await reimbursementService.getReimbursementSummary(EmpID);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementTransactions = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const txs = await reimbursementService.getReimbursementTransactions(EmpID);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementRequestDetails = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const details = await reimbursementService.getReimbursementRequestDetails(EmpID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReimbursementRequest = async (req, res) => {
  try {
    await reimbursementService.submitReimbursementRequest(req.body, req.file?.buffer);
    res.json({ message: "Reimbursement request submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReimbursementRequestOnBehalf = async (req, res) => {
  try {
    await reimbursementService.submitReimbursementRequestOnBehalf(req.body, req.file?.buffer);
    res.json({ message: "Reimbursement request submitted on behalf" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editReimbursementRequest = async (req, res) => {
  try {
    await reimbursementService.editReimbursementRequest(req.body.ReimbursementID, req.body);
    res.json({ message: "Reimbursement request edited" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.draftSaveReimbursementRequest = async (req, res) => {
  try {
    await reimbursementService.draftSaveReimbursementRequest(req.body, req.file?.buffer);
    res.json({ message: "Reimbursement draft saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delegateReimbursementApproval = async (req, res) => {
  // Not possible in your ERD
  res.json({ error: "Delegation structure not present in current schema." });
};

exports.changeReimbursementApproval = async (req, res) => {
  try {
    await reimbursementService.changeReimbursementApproval(req.body.ReimbursementID, req.body.status);
    res.json({ message: "Reimbursement approval status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveRejectReimbursementRequest = async (req, res) => {
  try {
    await reimbursementService.approveRejectReimbursementRequest(req.body.ReimbursementID, req.body.action);
    res.json({ message: `Reimbursement ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingReimbursementRequestDetails = async (req, res) => {
  try {
    const { ReimbursementID } = req.query;
    const details = await reimbursementService.getPendingReimbursementRequestDetails(ReimbursementID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingReimbursementRequests = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await reimbursementService.getPendingReimbursementRequests(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
