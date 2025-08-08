const reimbursementService = require('../services/reimbursement.service');

// Submit a reimbursement (with receipt upload)
exports.submitReimbursement = async (req, res) => {
  try {
    await reimbursementService.submitReimbursementRequest(req.body, req.file?.buffer, req.cookies.EmpID, req.cookies.CompanyID);
    res.json({ message: "Reimbursement request submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementTransactions = async (req, res) => {
  try {

    const history = await reimbursementService.getReimbursementTransactions(req.cookies.EmpID, req.cookies.CompanyID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementRequestDetails = async (req, res) => {
  try {
    const ReqID = req.headers['reqid'];
    const details = await reimbursementService.getReimbursementRequestDetails(ReqID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveRejectReimbursement = async (req, res) => {
  try {
    await reimbursementService.approveRejectReimbursementRequest(req.body.ReqID, req.body.action);
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

    const pending = await reimbursementService.getPendingReimbursementRequests(req.cookies.EmpID);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelReimbursement = async (req, res) => {
  try {
    await reimbursementService.cancelReimbursementRequest(req.headers['reqid']);
    res.json({ message: "Reimbursement request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementById = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid'];
    const result = await reimbursementService.getReimbursementRequestDetails(ReimbursementID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid']; 
    const details = await reimbursementService.getReimbursementRequestDetails(ReimbursementID);
    const buffer = details?.Attachment;
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

exports.getReimbursementTransactions = async (req, res) => {
  try {
    const { EmpID, context } = req.cookies;
    const txs = await reimbursementService.getReimbursementTransactions(EmpID, context.CompanyID);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementRequestDetails = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid'];
    const details = await reimbursementService.getReimbursementRequestDetails(ReimbursementID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReimbursementRequest = async (req, res) => {
  try {
    const { EmpID, context } = req.cookies;
    await reimbursementService.submitReimbursementRequest(req.body, req.file?.buffer, EmpID, context.CompanyID);
    res.json({ message: "Reimbursement request submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReimbursementRequestOnBehalf = async (req, res) => {
  try {
    const { context } = req.cookies;
    await reimbursementService.submitReimbursementRequestOnBehalf(req.body, req.file?.buffer, req.body.EmpID, context.CompanyID);
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
    const { EmpID, context } = req.cookies;
    await reimbursementService.draftSaveReimbursementRequest(req.body, req.file?.buffer, EmpID, context.CompanyID);
    res.json({ message: "Reimbursement draft saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delegateReimbursementApproval = async (req, res) => {
  try {
    const { ReimbursementID, newApproverEmpID } = req.body;
    await reimbursementService.delegateReimbursementApproval(ReimbursementID, newApproverEmpID);
    res.json({ message: "Reimbursement approval delegated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeReimbursementApproval = async (req, res) => {
  try {
    await reimbursementService.changeReimbursementApproval(req.body.ReimbursementID);
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
    const ReimbursementID = req.headers['reqid'];
    const details = await reimbursementService.getPendingReimbursementRequestDetails(ReimbursementID);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingReimbursementRequests = async (req, res) => {
  try {

    const result = await reimbursementService.getPendingReimbursementRequests(req.cookies.EmpID, req.cookies.context.CompanyID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
