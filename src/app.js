const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');

// Routers (add all your routers here)
const profileRoutes = require('./routes/profile.routes');
const announcementRoutes = require('./routes/announcement.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const businessTripRoutes = require('./routes/businessTrip.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const documentRoutes = require('./routes/document.routes');
const excuseRoutes = require('./routes/excuse.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const flightTicketRoutes = require('./routes/flightTicket.routes');
const leaveRoutes = require('./routes/leave.routes');
const managerRoutes = require('./routes/manager.routes');
const notificationRoutes = require('./routes/notification.routes');
const payrollRoutes = require('./routes/payroll.routes');
const performanceRoutes = require('./routes/performance.routes');
const reimbursementRoutes = require('./routes/reimbursement.routes');
const teamRoutes = require('./routes/team.routes');
const requestRoutes = require('./routes/request.routes');

const app = express();

// Security and middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Routers (mount with an API prefix)
app.use('/api/profile', profileRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/businessTrip', businessTripRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/excuse', excuseRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/flightTicket', flightTicketRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/reimbursement', reimbursementRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/request', requestRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// 404 handling
app.use((req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler (for unhandled errors)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
