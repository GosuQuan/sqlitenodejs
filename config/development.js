/**
 * Development environment specific configuration
 */
module.exports = {
  server: {
    port: process.env.PORT || 3000,
  },
  logging: {
    level: 'debug',
  },
  database: {
    logging: true,
  },
};
