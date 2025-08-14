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

    // Helpers to normalize keys according to backend conventions
    const idSynonyms = new Set([
      'reqid', 'requestid', 'requestId', 'ReqID', 'LeaveReqID', 'LeaveID', 'tripid', 'TripID',
      'ReimbursementID', 'DocumentID', 'FlightTicketID', 'requestID'
    ]);
    const toLowerSafe = (s) => (typeof s === 'string' ? s.toLowerCase() : s);
    const isIdLike = (k) => idSynonyms.has(k) || idSynonyms.has(String(k || '')) || idSynonyms.has(String(k || '').toLowerCase());

    const normalizeHeaderKey = (k) => {
      const lk = toLowerSafe(k || '');
      if (lk === 'id') return 'id'; // for endpoints like document delete which use 'id'
      if (lk === 'leavereqid' || lk === 'reqid' || lk === 'requestid' || lk === 'tripid' || lk === 'requestid') return 'reqid';
      return k || '';
    };

    const ensureReqIdHeaderHeuristic = (pathOnly, method, originalHeaders) => {
      // If Postman already had an id-like header, we'll handle via normalization.
      const hadAnyId = (originalHeaders || []).some(h => {
        const hk = (h && h.key) ? String(h.key) : '';
        const lk = hk.toLowerCase();
        return lk === 'reqid' || lk === 'leavereqid' || lk === 'requestid' || lk === 'tripid' || lk === 'id';
      });
      if (hadAnyId) return true;
      // Heuristic: many GET detail endpoints require an id header
      if (method === 'GET' && /details?/i.test(pathOnly)) return true;
      return false;
    };

    const normalizeHeaders = (rawHeaders, pathOnly, method) => {
      const out = [];
      const seen = new Set();
      const src = Array.isArray(rawHeaders) ? rawHeaders : [];
      for (const h of src) {
        const key = normalizeHeaderKey(h && h.key);
        const lk = toLowerSafe(key);
        if (!key) continue;
        if (seen.has(lk)) continue;
        seen.add(lk);
        out.push({ key, value: (h && h.value !== undefined) ? h.value : '' });
      }
      // Document delete uses header 'id'
      if (pathOnly.endsWith('/api/document/deleteDocument') && !seen.has('id')) {
        out.push({ key: 'id', value: '' });
      }
      // If we think it needs reqid but none present, add it
      if (ensureReqIdHeaderHeuristic(pathOnly, method, src) && !out.some(h => String(h.key).toLowerCase() === 'reqid') && !pathOnly.endsWith('/api/document/deleteDocument')) {
        out.push({ key: 'reqid', value: '{{reqid}}' });
      }
      return out;
    };

    // Normalize body into a Postman-like body shape with lowercase id keys
    const normalizeBody = (bodyDef) => {
      if (!bodyDef || typeof bodyDef !== 'object') return null;
      const mode = String(bodyDef.mode || '').toLowerCase();
      if (mode === 'raw') {
        const raw = bodyDef.raw;
        if (typeof raw !== 'string' || !raw.trim()) return { mode: 'raw', raw: '' };
        try {
          const parsed = JSON.parse(raw);
          const mapped = {};
          Object.keys(parsed).forEach(k => {
            const v = parsed[k];
            if (String(k).toLowerCase() === 'empid') mapped['empid'] = v;
            else if (isIdLike(k)) mapped['reqid'] = v;
            else mapped[k] = v;
          });
          return { mode: 'raw', raw: JSON.stringify(mapped, null, 2) };
        } catch {
          // Not JSON, return as-is
          return { mode: 'raw', raw };
        }
      } else if (mode === 'formdata') {
        const items = Array.isArray(bodyDef.formdata) ? bodyDef.formdata : [];
        const outItems = items.map(it => {
          const key = it && it.key ? it.key : '';
          const type = it && it.type ? it.type : 'text';
          // Only normalize EmpID here; other domain keys must retain original case
          const newKey = (String(key).toLowerCase() === 'empid') ? 'empid' : key;
          const item = { key: newKey, type };
          if (type !== 'file') item.value = (it && it.value !== undefined) ? it.value : '';
          return item;
        });
        return { mode: 'formdata', formdata: outItems };
      } else if (mode === 'urlencoded') {
        const items = Array.isArray(bodyDef.urlencoded) ? bodyDef.urlencoded : [];
        const outItems = items.map(it => {
          const key = it && it.key ? it.key : '';
          const newKey = (String(key).toLowerCase() === 'empid') ? 'empid' : (isIdLike(key) ? 'reqid' : key);
          return { key: newKey, value: (it && it.value !== undefined) ? it.value : '' };
        });
        return { mode: 'urlencoded', urlencoded: outItems };
      }
      return null;
    };

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
        const pathOnly = url.replace(/\{\{\s*baseUrl\s*\}\}/g, '');
        const predefined = {
          headers: normalizeHeaders(headers, pathOnly, method),
          body: normalizeBody(body)
        };
        endpoints.push({ name: ep.name || '', method, url, headers, body, predefined });
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
