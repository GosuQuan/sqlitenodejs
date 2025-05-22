/**
 * Error handling middleware
 */
const logger = require('../utils/logger');

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  
  // Log error
  if (statusCode === 500) {
    logger.error(`Internal Server Error: ${err.message}\n${err.stack}`);
  } else {
    logger.warn(`${statusCode} - ${err.message}`);
  }
  
  // Send error response
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
