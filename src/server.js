const http = require('http');
const app = require('./app');

// Optionally, you can load environment variables from .env
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Optionally, shutdown cleanly on SIGINT/SIGTERM
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  server.close(() => process.exit(0));
});
