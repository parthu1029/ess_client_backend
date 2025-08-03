const feedbackService = require('../services/feedback.service');

// Submit new feedback
exports.submitFeedback = async (req, res) => {
  try {
    const data = req.body; // Expect details like: fromEmpID, toEmpID, typeID, comments, etc.
    await feedbackService.submitFeedback(data);
    res.json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get feedback history of the logged-in user or filtered by EmpID
exports.getFeedbackHistory = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const history = await feedbackService.getFeedbackHistory(EmpID);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get feedback received by a particular employee
exports.getReceivedFeedback = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const feedback = await feedbackService.getReceivedFeedback(EmpID);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get feedback by its ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.query;
    const feedback = await feedbackService.getFeedbackById(id);
    if (feedback) {
      res.json(feedback);
    } else {
      res.status(404).json({ error: 'Feedback not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update feedback by ID
exports.updateFeedback = async (req, res) => {
  try {
    const data = req.body; // Should include feedback ID and fields to update
    await feedbackService.updateFeedback(data);
    res.json({ message: 'Feedback updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete feedback by ID
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.query;
    await feedbackService.deleteFeedback(id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get list of feedback types (categories)
exports.getFeedbackTypes = async (req, res) => {
  try {
    const types = await feedbackService.getFeedbackTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get aggregate analytics of feedback (e.g., counts, ratings)
exports.getFeedbackAnalytics = async (req, res) => {
  try {
    const { EmpID } = req.query;
    const analytics = await feedbackService.getFeedbackAnalytics(EmpID);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Respond to feedback by its ID (e.g., adding a comment or resolution)
exports.respondToFeedback = async (req, res) => {
  try {
    const { id, response, responderEmpID } = req.body;
    await feedbackService.respondToFeedback(id, response, responderEmpID);
    res.json({ message: 'Responded to feedback' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark feedback as read
exports.markFeedbackAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    await feedbackService.markFeedbackAsRead(id);
    res.json({ message: 'Feedback marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all team feedback (could be filtered by team or manager)
exports.getTeamFeedback = async (req, res) => {
  try {
    const { teamId } = req.query;
    const feedback = await feedbackService.getTeamFeedback(teamId);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate feedback report (could be PDF/Excel generation)
exports.generateFeedbackReport = async (req, res) => {
  try {
    const filters = req.body; // Filters or parameters for report
    const report = await feedbackService.generateFeedbackReport(filters);
    // For simplicity, return report data or path/url to generated report
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
