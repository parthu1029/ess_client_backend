const payrollService = require('../services/payrollService');

exports.getPayslip = async (req, res) => {
    try {
        const { empId } = req.params;
        const { month, year } = req.query;
        
        const payslip = await payrollService.getPayslip(empId, { month, year });
        
        if (!payslip) {
            return res.status(404).json({ error: 'Payslip not found' });
        }
        
        res.json(payslip);
    } catch (error) {
        console.error('Payslip fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch payslip' });
    }
};

exports.getPayslipHistory = async (req, res) => {
    try {
        const { empId } = req.params;
        const history = await payrollService.getPayslipHistory(empId);
        res.json(history);
    } catch (error) {
        console.error('Payslip history error:', error);
        res.status(500).json({ error: 'Failed to fetch payslip history' });
    }
};

exports.updateBankDetails = async (req, res) => {
    try {
        const { empId } = req.params;
        const bankDetails = req.body;
        
        await payrollService.updateBankDetails(empId, bankDetails);
        res.json({ message: 'Bank details updated successfully' });
    } catch (error) {
        console.error('Bank details update error:', error);
        res.status(500).json({ error: 'Failed to update bank details' });
    }
};
