const flightTicketService = require('../services/flightTicket.services');

// Get flight ticket request details for an employee
exports.getFlightTicketRequestDetails = async (req, res) => {
  try {
    
    const details = await flightTicketService.getFlightTicketRequestDetails(req.headers.reqid);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get flight ticket transactions/history
exports.getFlightTicketTransactions = async (req, res) => {
  try {
    
    const transactions = await flightTicketService.getFlightTicketTransactions(req.cookies.empid, req.cookies.context.companyid);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit a new flight ticket request
exports.submitFlightTicketRequest = async (req, res) => {
  try {
    const data = req.body; // expects all needed fields
    await flightTicketService.submitFlightTicketRequest(data);
    res.json({ message: 'Flight ticket request submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit flight ticket request on behalf of another employee
exports.submitFlightTicketRequestOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    await flightTicketService.submitFlightTicketRequestOnBehalf(data);
    res.json({ message: 'Flight ticket request submitted on behalf successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit (patch) existing flight ticket request
exports.editFlightTicketRequest = async (req, res) => {
  try {
    const { requestId, ...updateData } = req.body;
    await flightTicketService.editFlightTicketRequest(requestId, updateData);
    res.json({ message: 'Flight ticket request updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Draft save flight ticket request
exports.draftSaveFlightTicketRequest = async (req, res) => {
  try {
    const data = req.body;
    await flightTicketService.draftSaveFlightTicketRequest(data);
    res.json({ message: 'Flight ticket request draft saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate flight ticket approval to another approver
exports.delegateFlightTicketApproval = async (req, res) => {
  try {
    const { requestId, newApproverEmpID } = req.body;
    await flightTicketService.delegateFlightTicketApproval(requestId, newApproverEmpID);
    res.json({ message: 'Flight ticket approval delegated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change flight ticket request approval status
exports.changeFlightTicketApproval = async (req, res) => {
  try {
    const { requestId, approvalStatus } = req.body;
    await flightTicketService.changeFlightTicketApproval(requestId, approvalStatus);
    res.json({ message: 'Flight ticket approval status changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject flight ticket request
exports.approveRejectFlightTicketRequest = async (req, res) => {
  try {
    const { requestId, action, comments } = req.body; // action: 'approve' or 'reject'
    await flightTicketService.approveRejectFlightTicketRequest(requestId, action, comments);
    res.json({ message: `Flight ticket request ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get details for a pending flight ticket request
exports.getPendingFlightTicketRequestsDetails = async (req, res) => {
  try {
    const { requestId } = req.query;
    const details = await flightTicketService.getPendingFlightTicketRequestsDetails(requestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending flight ticket requests for approver
exports.getPendingFlightTicketRequests = async (req, res) => {
  try {
    const pendingRequests = await flightTicketService.getPendingFlightTicketRequests(req.cookies.EmpID);
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
