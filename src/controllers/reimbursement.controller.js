const reimbursementService = require('../services/reimbursement.service');

// Submit a reimbursement (with receipt upload)
exports.submitReimbursement = async (req, res) => {
  try {
    const ReimbursementID = await reimbursementService.submitReimbursementRequest(
      req.body,
      req.file?.buffer,
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement request submitted", ReimbursementID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.approveRejectReimbursement = async (req, res) => {
  try {
    await reimbursementService.approveRejectReimbursementRequest(
      req.body.reqid,
      req.body.action,
      req.cookies.context.companyid
    );
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
    const pending = await reimbursementService.getPendingReimbursementRequests(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelReimbursement = async (req, res) => {
  try {
    await reimbursementService.cancelReimbursementRequest(
      req.headers['reqid'],
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementById = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid'];
    const result = await reimbursementService.getReimbursementRequestDetails(
      ReimbursementID,
      req.cookies.context.companyid
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid']; 
    const details = await reimbursementService.getReimbursementRequestDetails(
      ReimbursementID,
      req.cookies.context.companyid
    );
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
    const txs = await reimbursementService.getReimbursementTransactions(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReimbursementRequestDetails = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid'];
    const details = await reimbursementService.getReimbursementRequestDetails(
      ReimbursementID,
      req.cookies.context.companyid
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReimbursementRequest = async (req, res) => {
  try {
    const ReimbursementID = await reimbursementService.submitReimbursementRequest(
      req.body,
      req.file?.buffer,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size,
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement request submitted", ReimbursementID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitReimbursementRequestOnBehalf = async (req, res) => {
  try {
    const ReimbursementID = await reimbursementService.submitReimbursementRequestOnBehalf(
      req.body,
      req.file?.buffer,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size,
      req.body.empid,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement request submitted on behalf", ReimbursementID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editReimbursementRequest = async (req, res) => {
  try {
    await reimbursementService.editReimbursementRequest(
      req.body.reqid,
      req.body,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement request edited" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.draftSaveReimbursementRequest = async (req, res) => {
  try {
    const ReimbursementID = await reimbursementService.draftSaveReimbursementRequest(
      req.body,
      req.file?.buffer,
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement draft saved", ReimbursementID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delegateReimbursementApproval = async (req, res) => {
  try {
    const { reqid, newApproverEmpID } = req.body;
    await reimbursementService.delegateReimbursementApproval(
      reqid,
      newApproverEmpID,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement approval delegated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeReimbursementApproval = async (req, res) => {
  try {
    await reimbursementService.changeReimbursementApproval(
      req.body.reqid,
      req.cookies.context.companyid
    );
    res.json({ message: "Reimbursement approval status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveRejectReimbursementRequest = async (req, res) => {
  try {
    await reimbursementService.approveRejectReimbursementRequest(
      req.body.reqid,
      req.body.action,
      req.cookies.context.companyid
    );
    res.json({ message: `Reimbursement ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingReimbursementRequestDetails = async (req, res) => {
  try {
    const ReimbursementID = req.headers['reqid'];
    const details = await reimbursementService.getPendingReimbursementRequestDetails(
      ReimbursementID,
      req.cookies.context.companyid
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingReimbursementRequests = async (req, res) => {
  try {
    const result = await reimbursementService.getPendingReimbursementRequests(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
