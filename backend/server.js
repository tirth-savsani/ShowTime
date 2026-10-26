import { validateEnv, env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import { startAllJobs } from './jobs/index.js';

// Validate all required environment variables at boot
validateEnv();

const PORT = env.PORT || 8084;
const HOST = '0.0.0.0';

let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start background cron jobs (Spec B6.10)
    startAllJobs();

    // Start listening on 0.0.0.0:PORT
    server = app.listen(PORT, HOST, () => {
      console.log(`ShowTime API server running at http://${HOST}:${PORT} in ${env.NODE_ENV} mode`);
      console.log(`Health check available at http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
