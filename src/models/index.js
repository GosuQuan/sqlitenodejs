/**
 * Database models setup with Sequelize
 */
const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Sequelize with SQLite
const dbPath = path.resolve(config.get('database.path'));
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: config.get('database.logging') ? (msg) => logger.debug(msg) : false,
});

// Define models
const User = require('./user')(sequelize);

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
}

// Sync all models with database
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database synchronized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to synchronize database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  models: {
    User,
  },
  testConnection,
  syncDatabase,
};
