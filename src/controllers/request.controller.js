const requestService = require('../services/request.service');

exports.getRequestTransactions = async (req, res) => {
  try {
     // Pass ?EmpID=... for filtering, else get all (admin)
    const transactions = await requestService.getRequestTransactions(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestTimeline = async (req, res) => {
  try {
    const reqID = req.headers['reqid'];
    const timeline = await requestService.getRequestTimeline(reqID);
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get potential delegates for a user based on grade (same grade or grade-1)
exports.getDelegates = async (req, res) => {
  try {
    const EmpID = req.headers['empid'] || req.cookies.empid;
    const CompanyID = req.headers['companyid'] || req.cookies.context.companyid;
    const delegates = await requestService.getDelegates(EmpID, CompanyID);
    res.json(delegates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
