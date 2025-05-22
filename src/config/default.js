/**
 * Default configuration for all environments
 */
module.exports = {
  server: {
    port: process.env.PORT || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  },
  database: {
    path: process.env.DB_PATH || './database.sqlite',
  },
  auth: {
    github: {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
  },
  logging: {
    level: 'info',
    directory: './logs',
  },
};
