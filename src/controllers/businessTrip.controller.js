const businessTripService = require('../services/businessTrip.service');

// Get all business trip request details for a user
exports.getBusinessTripRequestDetails = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await businessTripService.getBusinessTripRequestDetails(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View business trip transactions (history/list)
exports.getBusinessTripTransactions = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await businessTripService.getBusinessTripTransactions(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User submits a new business trip request
exports.submitBusinessTripRequest = async (req, res) => {
  try {
    const data = req.body; // Should include EmpID, dates, purpose, etc.
    await businessTripService.submitBusinessTripRequest(data);
    res.json({ message: 'Business trip request submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit on behalf of another employee
exports.submitBusinessTripRequestOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    await businessTripService.submitBusinessTripRequestOnBehalf(data);
    res.json({ message: 'Business trip request submitted on behalf' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit (patch) a business trip request
exports.editBusinessTripRequest = async (req, res) => {
  try {
    const { tripId, ...updateData } = req.body;
    await businessTripService.editBusinessTripRequest(tripId, updateData);
    res.json({ message: 'Business trip request updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save a business trip request as draft
exports.draftSaveBusinessTripRequest = async (req, res) => {
  try {
    const data = req.body;
    await businessTripService.draftSaveBusinessTripRequest(data);
    res.json({ message: 'Business trip request draft saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate approval to another manager/approver
exports.delegateBusinessTripApproval = async (req, res) => {
  try {
    const { tripId, newApproverEmpID } = req.body;
    await businessTripService.delegateBusinessTripApproval(tripId, newApproverEmpID);
    res.json({ message: 'Business trip approval delegated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change approval status/state (patch)
exports.changeBusinessTripApproval = async (req, res) => {
  try {
    const { tripId, approvalStatus } = req.body;
    await businessTripService.changeBusinessTripApproval(tripId, approvalStatus);
    res.json({ message: 'Business trip approval status changed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject a business trip request
exports.approveRejectBusinessTripRequest = async (req, res) => {
  try {
    const { tripId, action, comments } = req.body; // action='approve'/'reject'
    await businessTripService.approveRejectBusinessTripRequest(tripId, action, comments);
    res.json({ message: `Business trip has been ${action}ed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending business trip requests for approver
exports.getPendingBusinessTripRequests = async (req, res) => {
  try {
    const { ApproverEmpID } = req.query;
    const result = await businessTripService.getPendingBusinessTripRequests(ApproverEmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending request details (single request)
exports.getPendingBusinessTripRequestDetails = async (req, res) => {
  try {
    const { tripId } = req.query;
    const result = await businessTripService.getPendingBusinessTripRequestDetails(tripId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
