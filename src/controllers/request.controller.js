const requestService = require('../services/request.service');

exports.getRequestTransactions = async (req, res) => {
  try {
     // Pass ?EmpID=... for filtering, else get all (admin)
    const transactions = await requestService.getRequestTransactions(
      req.cookies.EmpID,
      req.cookies.Context?.CompanyID || req.cookies.context?.CompanyID
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
