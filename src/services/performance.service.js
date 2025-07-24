const { pool } = require('../config/database');
const sql = require('mssql');

exports.submitSelfEvaluation = async (empId, evaluationData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('goals', sql.VarChar(1000), evaluationData.goals);
    request.input('achievements', sql.VarChar(1000), evaluationData.achievements);
    request.input('challenges', sql.VarChar(1000), evaluationData.challenges);
    request.input('selfRating', sql.Int, evaluationData.selfRating);
    
    await request.query(`
        INSERT INTO SelfEvaluationTable (EmpID, Goals, Achievements, Challenges, SelfRating, SubmissionDate)
        VALUES (@empId, @goals, @achievements, @challenges, @selfRating, GETDATE())
    `);
};

exports.getFeedback = async (empId) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    
    const result = await request.query(`
        SELECT 
            f.FeedbackID,
            f.Comments,
            f.Score,
            f.ReviewDate,
            f.ReviewPeriod,
            m.Name as ManagerName
        FROM FeedbackTable f
        JOIN EmpProfileTable m ON f.ReviewerID = m.EmpID
        WHERE f.EmpID = @empId
        ORDER BY f.ReviewDate DESC
    `);
    
    return result.recordset;
};

exports.submitManagerFeedback = async (empId, managerId, feedbackData) => {
    const request = pool.request();
    request.input('empId', sql.VarChar(30), empId);
    request.input('managerId', sql.VarChar(30), managerId);
    request.input('comments', sql.VarChar(1000), feedbackData.comments);
    request.input('score', sql.Int, feedbackData.score);
    request.input('goals', sql.VarChar(1000), feedbackData.goals);
    request.input('reviewPeriod', sql.VarChar(20), feedbackData.reviewPeriod);
    
    await request.query(`
        INSERT INTO FeedbackTable (EmpID, ReviewerID, Comments, Score, Goals, ReviewPeriod, ReviewDate)
        VALUES (@empId, @managerId, @comments, @score, @goals, @reviewPeriod, GETDATE())
    `);
};
