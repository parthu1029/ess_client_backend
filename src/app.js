const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const normalizeCookies = require('./middlewares/normalizeCookies');
const path = require('path');
const fs = require('fs');

// Routers (add all your routers here)
const profileRoutes = require('./routes/profile.routes');

const attendanceRoutes = require('./routes/attendance.routes');
const businessTripRoutes = require('./routes/businessTrip.routes');

const documentRoutes = require('./routes/document.routes');
const excuseRoutes = require('./routes/excuse.routes');

const flightTicketRoutes = require('./routes/flightTicket.routes');
const leaveRoutes = require('./routes/leave.routes');
const managerRoutes = require('./routes/manager.routes');
const notificationRoutes = require('./routes/notification.routes');
const payrollRoutes = require('./routes/payroll.routes');
const reimbursementRoutes = require('./routes/reimbursement.routes');
const teamRoutes = require('./routes/team.routes');
const requestRoutes = require('./routes/request.routes');

const app = express();

// Security and middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(normalizeCookies);

// Web UI: expose endpoints from Postman collection for dynamic rendering
app.get('/web/endpoints', (req, res) => {
  try {
    const collectionPath = path.join(__dirname, '..', 'postman', 'ESS_Client_Backend_API.postman_collection.json');
    const raw = fs.readFileSync(collectionPath, 'utf8');
    const col = JSON.parse(raw);
    const modules = [];
    const topItems = Array.isArray(col.item) ? col.item : [];
    for (const mod of topItems) {
      const moduleName = mod && mod.name ? mod.name : 'Misc';
      const endpoints = [];
      const subItems = (mod && Array.isArray(mod.item)) ? mod.item : [];
      for (const ep of subItems) {
        const req = ep && ep.request ? ep.request : {};
        const method = (req.method || 'GET').toUpperCase();
        let url = '';
        const u = req.url;
        if (typeof u === 'string') {
          url = u;
        } else if (u && typeof u === 'object') {
          url = u.raw || '';
        }
        const headers = Array.isArray(req.header) ? req.header : [];
        const body = req.body || null;
        endpoints.push({ name: ep.name || '', method, url, headers, body });
      }
      modules.push({ name: moduleName, endpoints });
    }
    res.json({ modules });
  } catch (e) {
    console.error('Failed to load Postman collection for /web/endpoints:', e);
    res.status(500).json({ error: 'Failed to load endpoints' });
  }
});

// Serve the static testing UI at /web
app.use('/web', express.static(path.join(__dirname, '..', 'web_application')));
// Routers (mount with an API prefix)
app.use('/api/profile', profileRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/api/businessTrip', businessTripRoutes);

app.use('/api/document', documentRoutes);
app.use('/api/excuse', excuseRoutes);

app.use('/api/flightTicket', flightTicketRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/payroll', payrollRoutes);
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
