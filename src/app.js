/**
 * Main application entry point
 */
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middlewares/error');
const auth = require('./middlewares/auth');
const apiRoutes = require('./routes');
const db = require('./models');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session(config.get('session')));

// Authentication middleware
app.use(auth.initialize());
app.use(auth.session());

// API routes
app.use('/api', apiRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Enterprise Node.js Service API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.get('server.port');

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting application.');
      process.exit(1);
    }
    
    // Sync database models
    await db.syncDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app; // For testing purposes
