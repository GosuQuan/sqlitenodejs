/**
 * Authentication middleware
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const config = require('../config');
const { models } = require('../models');
const logger = require('../utils/logger');

// Configure local strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await models.User.findOne({ where: { email } });
        
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        // Update last login time
        await user.update({ lastLogin: new Date() });
        
        return done(null, user);
      } catch (error) {
        logger.error('Error in local authentication:', error);
        return done(error);
      }
    }
  )
);

// Configure GitHub strategy for OAuth authentication
passport.use(
  new GitHubStrategy(
    {
      clientID: config.get('auth.github.clientID'),
      clientSecret: config.get('auth.github.clientSecret'),
      callbackURL: config.get('auth.github.callbackURL'),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user based on GitHub ID
        let user = await models.User.findOne({
          where: { githubId: profile.id },
        });
        
        if (!user) {
          // Check if user with same email exists
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (email) {
            user = await models.User.findOne({ where: { email } });
            if (user) {
              // Link GitHub ID to existing user
              user.githubId = profile.id;
              await user.save();
            }
          }
          
          // If still no user, create a new one
          if (!user) {
            user = await models.User.create({
              username: profile.username || `github_${profile.id}`,
              email: email || `${profile.id}@github.example.com`,
              githubId: profile.id,
              password: null, // No password for OAuth users
            });
          }
        }
        
        // Update last login time
        await user.update({ lastLogin: new Date() });
        
        return done(null, user);
      } catch (error) {
        logger.error('Error in GitHub authentication:', error);
        return done(error);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await models.User.findByPk(id);
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error);
  }
});

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, config.get('jwt.secret'), (err, user) => {
      if (err) {
        logger.warn('JWT verification failed:', err.message);
        return res.sendStatus(403);
      }
      
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      logger.warn(`User ${req.user.id} attempted to access restricted route without proper role`);
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
  };
};

module.exports = {
  passport,
  authenticateJWT,
  authorizeRole,
  initialize: () => {
    return passport.initialize();
  },
  session: () => {
    return passport.session();
  },
};
