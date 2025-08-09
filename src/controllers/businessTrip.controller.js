const businessTripService = require('../services/businessTrip.service');

// Get all business trip request details for a user
exports.getBusinessTripRequestDetails = async (req, res) => {
  try {
    const ReqID = req.headers['reqid'];
    const result = await businessTripService.getBusinessTripRequestDetails(ReqID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View business trip transactions
exports.getBusinessTripTransactions = async (req, res) => {
  try {
    const EmpID = req.cookies.EmpID;
    const CompanyID = req.cookies.context.CompanyID;
    const result = await businessTripService.getBusinessTripTransactions(EmpID, CompanyID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User submits a new business trip request
exports.submitBusinessTripRequest = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;
    console.log(data);
    const reqID = await businessTripService.submitBusinessTripRequest(
      data,
      file?.buffer,
      file?.originalname,
      file?.mimetype,
      file?.size,
      req.cookies.EmpID,
      req.cookies.context.CompanyID
    );
    res.json({ message: 'Business trip request submitted', reqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit on behalf of another employee
exports.submitBusinessTripRequestOnBehalf = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;
    const actorEmpID = req.body.EmpID;
    const CompanyID = req.cookies.context.CompanyID;
    const reqID = await businessTripService.submitBusinessTripRequestOnBehalf(
      data,
      file?.buffer,
      file?.originalname,
      file?.mimetype,
      file?.size,
      actorEmpID,
      CompanyID
    );
    res.json({ message: 'Business trip request submitted on behalf', reqID });
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
    const file = req.file;
    const reqID = await businessTripService.draftSaveBusinessTripRequest(
      data,
      file?.buffer,
      file?.originalname,
      file?.mimetype,
      file?.size,
      req.cookies.context.CompanyID
    );
    res.json({ message: 'Business trip request draft saved', reqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate a business trip request to another approver
exports.delegateBusinessTripRequest = async (req, res) => {
  try {
    const { reqID, newApproverEmpID, comments } = req.body;
    const actorEmpID = req.cookies.EmpID;
    const CompanyID = req.cookies.context.CompanyID;
    await businessTripService.delegateBusinessTripRequest(
      reqID,
      newApproverEmpID,
      actorEmpID,
      comments,
      CompanyID
    );
    res.json({ message: 'Business trip request delegated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change approval status/state (patch)
exports.changeBusinessTripApproval = async (req, res) => {
  try {
    const {tripId} = req.body;
    await businessTripService.changeBusinessTripApproval(tripId);
    res.json({ message: 'Business trip approval status changed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject a business trip request
exports.approveRejectBusinessTripRequest = async (req, res) => {
  try {
    const { tripId, action, comments } = req.body;
    await businessTripService.approveRejectBusinessTripRequest(tripId, action, comments);
    res.json({ message: `Business trip has been ${action}ed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pending business trip requests for approver
exports.getPendingBusinessTripRequests = async (req, res) => {
  try {
    const result = await businessTripService.getPendingBusinessTripRequests(req.cookies.EmpID, req.cookies.context.CompanyID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending request details (single request)
exports.getPendingBusinessTripRequestDetails = async (req, res) => {
  try {
    const tripId = req.headers['tripid'];
    const result = await businessTripService.getPendingBusinessTripRequestDetails(tripId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
