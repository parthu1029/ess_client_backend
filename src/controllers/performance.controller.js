const performanceService = require('../services/performanceService');

exports.submitSelfEvaluation = async (req, res) => {
    try {
        const { empId } = req.params;
        const evaluationData = req.body;
        
        await performanceService.submitSelfEvaluation(empId, evaluationData);
        res.json({ message: 'Self evaluation submitted successfully' });
    } catch (error) {
        console.error('Self evaluation error:', error);
        res.status(500).json({ error: 'Failed to submit self evaluation' });
    }
};

exports.getFeedback = async (req, res) => {
    try {
        const { empId } = req.params;
        const feedback = await performanceService.getFeedback(empId);
        res.json(feedback);
    } catch (error) {
        console.error('Feedback fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

exports.submitManagerFeedback = async (req, res) => {
    try {
        const { empId } = req.params;
        const { managerId, feedbackData } = req.body;
        
        await performanceService.submitManagerFeedback(empId, managerId, feedbackData);
        res.json({ message: 'Manager feedback submitted successfully' });
    } catch (error) {
        console.error('Manager feedback error:', error);
        res.status(500).json({ error: 'Failed to submit manager feedback' });
    }
};
