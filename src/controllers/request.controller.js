const requestService = require('../services/request.service');

exports.getRequestTransactions = async (req, res) => {
  try {
    const EmpID = req.query.EmpID; // Pass ?EmpID=... for filtering, else get all (admin)
    const transactions = await requestService.getRequestTransactions(EmpID);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
