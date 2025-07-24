const attendanceService = require('../services/attendanceService');

exports.markAttendance = async (req, res) => {
    try {
        const { empId, type } = req.body; // type: 'checkin' or 'checkout'
        
        let result;
        if (type === 'checkin') {
            result = await attendanceService.checkIn(empId);
        } else if (type === 'checkout') {
            result = await attendanceService.checkOut(empId);
        } else {
            return res.status(400).json({ error: 'Invalid attendance type' });
        }
        
        console.log(`ATTENDANCE: Employee ${empId} ${type} at ${result.time}`);
        res.json({ message: `${type} successful`, time: result.time });
    } catch (error) {
        console.error('Attendance marking error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

exports.getDailyStatus = async (req, res) => {
    try {
        const { empId } = req.params;
        const status = await attendanceService.getDailyStatus(empId);
        res.json(status);
    } catch (error) {
        console.error('Daily status error:', error);
        res.status(500).json({ error: 'Failed to fetch daily status' });
    }
};

exports.getAttendanceHistory = async (req, res) => {
    try {
        const { empId } = req.params;
        const { month, year } = req.query;
        
        const history = await attendanceService.getAttendanceHistory(empId, { month, year });
        res.json(history);
    } catch (error) {
        console.error('Attendance history error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
};

exports.getMonthlySummary = async (req, res) => {
    try {
        const { empId } = req.params;
        const { month, year } = req.query;
        
        const summary = await attendanceService.getMonthlySummary(empId, { month, year });
        res.json(summary);
    } catch (error) {
        console.error('Monthly summary error:', error);
        res.status(500).json({ error: 'Failed to fetch monthly summary' });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { empId } = req.params;
        const { date, checkInTime, checkOutTime, workingHours } = req.body;
        
        await attendanceService.updateAttendance(empId, {
            date, checkInTime, checkOutTime, workingHours
        });
        
        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Attendance update error:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
};
