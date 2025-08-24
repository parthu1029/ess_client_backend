const flightTicketService = require('../services/flightTicket.services');

// Get flight ticket request details for an employee
exports.getFlightTicketRequestDetails = async (req, res) => {
  try {
    
    const details = await flightTicketService.getFlightTicketRequestDetails(
      req.headers['reqid'],
      req.cookies.context.companyid
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get flight ticket transactions/history
exports.getFlightTicketTransactions = async (req, res) => {
  try {
    
    const transactions = await flightTicketService.getFlightTicketTransactions(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit a new flight ticket request
exports.submitFlightTicketRequest = async (req, res) => {
  try {
    const data = req.body; // expects all needed fields
    const ReqID = await flightTicketService.submitFlightTicketRequest(
      data,
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json({ message: 'Flight ticket request submitted successfully', ReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit flight ticket request on behalf of another employee
exports.submitFlightTicketRequestOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    const ReqID = await flightTicketService.submitFlightTicketRequestOnBehalf(
      data,
      req.body.empid,
      req.cookies.context.companyid
    );
    res.json({ message: 'Flight ticket request submitted on behalf successfully', ReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit (patch) existing flight ticket request
exports.editFlightTicketRequest = async (req, res) => {
  try {
    const { reqid: requestId, ...updateData } = req.body;
    await flightTicketService.editFlightTicketRequest(
      requestId,
      updateData,
      req.cookies.context.companyid
    );
    res.json({ message: 'Flight ticket request updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Draft save flight ticket request
exports.draftSaveFlightTicketRequest = async (req, res) => {
  try {
    const data = req.body;
    const ReqID = await flightTicketService.draftSaveFlightTicketRequest(
      data,
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json({ message: 'Flight ticket request draft saved successfully', ReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate flight ticket approval to another approver
exports.delegateFlightTicketApproval = async (req, res) => {
  try {
    const { reqid: requestId, newApproverEmpID } = req.body;
    await flightTicketService.delegateFlightTicketApproval(
      requestId,
      newApproverEmpID,
      req.body.comments,
      req.cookies.context.companyid
    );
    res.json({ message: 'Flight ticket approval delegated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change flight ticket request approval status
exports.changeFlightTicketApproval = async (req, res) => {
  try {
    const { reqid: requestId, comments } = req.body;
    await flightTicketService.changeFlightTicketApproval(
      requestId,
      comments,
      req.cookies.context.companyid
    );
    res.json({ message: 'Flight ticket approval status changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject flight ticket request
exports.approveRejectFlightTicketRequest = async (req, res) => {
  try {
    const { reqid: requestId, action, comments } = req.body; // action: 'approve' or 'reject'
    await flightTicketService.approveRejectFlightTicketRequest(
      requestId,
      action,
      comments,
      req.cookies.context.companyid
    );
    res.json({ message: `Flight ticket request ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get details for a pending flight ticket request
exports.getPendingFlightTicketRequestDetails = async (req, res) => {
  try {
    const { reqid: requestId } = req.body;
    const details = await flightTicketService.getPendingFlightTicketRequestsDetails(
      requestId
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending flight ticket requests for approver
exports.getPendingFlightTicketRequests = async (req, res) => {
  try {
    const pendingRequests = await flightTicketService.getPendingFlightTicketRequests(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
