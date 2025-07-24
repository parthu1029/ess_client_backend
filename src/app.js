const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');

// Import all route modules
const profileRoutes = require('./routes/profileRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const documentRoutes = require('./routes/documentRoutes');
const managerRoutes = require('./routes/managerRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');
const excuseRoutes = require('./routes/excuseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Trust proxy for deployment environments
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Static file serving for uploads (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Employee Management API'
    });
});

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', managerRoutes); // Admin routes use same controller
app.use('/api/logs', auditRoutes);
app.use('/api/reimbursement', reimbursementRoutes);
app.use('/api/excuse', excuseRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Employee Management System API',
        version: '1.0.0',
        documentation: '/api/docs',
        status: 'Running'
    });
});

// API documentation endpoint (placeholder)
app.get('/api/docs', (req, res) => {
    res.json({
        message: 'API Documentation',
        endpoints: {
            profile: '/api/profile',
            attendance: '/api/attendance',
            leave: '/api/leave',
            payroll: '/api/payroll',
            performance: '/api/performance',
            announcements: '/api/announcements',
            documents: '/api/documents',
            manager: '/api/manager',
            admin: '/api/admin',
            logs: '/api/logs',
            reimbursement: '/api/reimbursement',
            excuse: '/api/excuse',
            notifications: '/api/notifications'
        }
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist`,
        availableRoutes: [
            '/api/profile',
            '/api/attendance',
            '/api/leave',
            '/api/payroll',
            '/api/performance',
            '/api/announcements',
            '/api/documents',
            '/api/manager',
            '/api/admin',
            '/api/logs',
            '/api/reimbursement',
            '/api/excuse',
            '/api/notifications'
        ]
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authentication credentials'
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: 'File too large',
            message: 'File size exceeds the allowed limit'
        });
    }

    // Database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEOUT') {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: 'Database connection failed'
        });
    }

    // Default server error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong on our end' 
            : err.message,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;
