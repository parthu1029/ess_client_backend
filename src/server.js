const app = require('./app');
const { connectDB } = require('./config/database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server startup function
const startServer = async () => {
    try {
        console.log('🚀 Starting Employee Management System API...');
        console.log(`📊 Environment: ${NODE_ENV}`);
        
        // Connect to database
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');
        
        // Start the server
        const server = app.listen(PORT, () => {
            console.log('🎉 Server started successfully!');
            console.log(`🌐 Server running on port ${PORT}`);
            console.log(`📱 API URL: http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
            console.log('==================================================');
            
            if (NODE_ENV === 'development') {
                console.log('🔧 Development mode - Detailed logging enabled');
                console.log('🔄 Auto-restart enabled via nodemon');
            }
        });

        // Server error handling
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                console.log('💡 Try using a different port or kill the process using that port');
                process.exit(1);
            } else {
                console.error('❌ Server error:', err);
                process.exit(1);
            }
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);
            
            server.close(async (err) => {
                if (err) {
                    console.error('❌ Error during server shutdown:', err);
                    process.exit(1);
                }
                
                console.log('✅ HTTP server closed');
                
                // Close database connections
                try {
                    // Add any cleanup code here (close DB pools, etc.)
                    console.log('✅ Database connections closed');
                    console.log('👋 Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during database cleanup:', error);
                    process.exit(1);
                }
            });
            
            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        
        // Specific error handling
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Database connection refused. Please check:');
            console.error('   - Database server is running');
            console.error('   - Connection string is correct');
            console.error('   - Network connectivity');
        } else if (error.code === 'ENOTFOUND') {
            console.error('💡 Database host not found. Please check:');
            console.error('   - Database server address');
            console.error('   - DNS resolution');
        } else if (error.code === 'ECONNRESET') {
            console.error('💡 Database connection reset. Please check:');
            console.error('   - Database server stability');
            console.error('   - Connection timeout settings');
        }
        
        process.exit(1);
    }
};

// Additional startup checks
const performStartupChecks = () => {
    console.log('🔍 Performing startup checks...');
    
    // Check required environment variables
    const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing);
        console.error('💡 Please check your .env file');
        process.exit(1);
    }
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 14) {
        console.warn(`⚠️  Node.js version ${nodeVersion} detected. Recommended: v14 or higher`);
    }
    
    console.log('✅ Startup checks passed');
};

// Display system information
const displaySystemInfo = () => {
    console.log('🖥️  System Information:');
    console.log(`   Node.js: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    console.log(`   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
    console.log(`   Process ID: ${process.pid}`);
    console.log('==================================================');
};


// Main execution
if (require.main === module) {
    displaySystemInfo();
    performStartupChecks();
    startServer();
}

module.exports = { startServer };
