const sql = require('mssql');

const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'EmployeeDB_3',
    user: process.env.DB_USER || 'testuser',
    password: process.env.DB_PASSWORD || '1234',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || true,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true,
        connectTimeout: 30000,
        requestTimeout: 30000,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
};

let pool;

const connectDB = async () => {
    try {
        if (pool && pool.connected) {
            return pool;
        }

        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to MSSQL Database');
        
        // Test the connection
        await pool.request().query('SELECT 1 as test');
        console.log('✅ Database connection test successful');
        
        return pool;
    } catch (err) {
        console.error('❌ Database connection error:', err);
        throw err;
    }
};

// Graceful shutdown
const closeDB = async () => {
    try {
        if (pool) {
            await pool.close();
            console.log('✅ Database connection closed');
        }
    } catch (err) {
        console.error('❌ Error closing database connection:', err);
    }
};

module.exports = { 
    connectDB, 
    closeDB, 
    get pool() { return pool; },
    sql 
};
