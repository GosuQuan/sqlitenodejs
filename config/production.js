/**
 * Production environment specific configuration
 */
module.exports = {
  server: {
    port: process.env.PORT || 8080,
  },
  logging: {
    level: 'error',
  },
  database: {
    logging: false,
  },
  session: {
    cookie: {
      secure: true,
      sameSite: 'strict',
    },
  },
};
