const performanceService = require('../services/performance.service');

exports.submitSelfEvaluation = async (req, res) => {
  try {
    const result = await performanceService.submitSelfEvaluation(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await performanceService.getFeedback(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitManagerFeedback = async (req, res) => {
  try {
    const result = await performanceService.submitManagerFeedback(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPerformanceReviews = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await performanceService.getPerformanceReviews(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPerformanceGoal = async (req, res) => {
  try {
    const result = await performanceService.createPerformanceGoal(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePerformanceGoal = async (req, res) => {
  try {
    const { goalId, ...data } = req.body;
    const result = await performanceService.updatePerformanceGoal(goalId, data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPerformanceGoals = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await performanceService.getPerformanceGoals(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await performanceService.getPerformanceMetrics(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPeerFeedback = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const result = await performanceService.getPeerFeedback(EmpID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitPeerFeedback = async (req, res) => {
  try {
    const result = await performanceService.submitPeerFeedback(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generatePerformanceReport = async (req, res) => {
  try {
    const result = await performanceService.generatePerformanceReport(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
