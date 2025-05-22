/**
 * Authentication controller
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const { models } = require('../models');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = await models.User.create({
      username,
      email,
      password,
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.get('jwt.secret'),
      { expiresIn: config.get('jwt.expiresIn') }
    );
    
    logger.info(`New user registered: ${user.email}`);
    
    // Return user info and token (exclude password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    logger.error('Error in user registration:', error);
    next(error);
  }
};

/**
 * Login user with email and password
 */
const login = async (req, res, next) => {
  try {
    // Passport authentication is handled by middleware
    // At this point, req.user is set by passport
    
    const user = req.user;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.get('jwt.secret'),
      { expiresIn: config.get('jwt.expiresIn') }
    );
    
    logger.info(`User logged in: ${user.email}`);
    
    // Return user info and token (exclude password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    
    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    logger.error('Error in user login:', error);
    next(error);
  }
};

/**
 * Handle OAuth callback
 */
const oauthCallback = (req, res) => {
  // Generate JWT token for OAuth user
  const user = req.user;
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.get('jwt.secret'),
    { expiresIn: config.get('jwt.expiresIn') }
  );
  
  logger.info(`User logged in via OAuth: ${user.email}`);
  
  // Redirect to frontend with token
  // In a real app, you would redirect to your frontend with the token
  res.redirect(`/auth/success?token=${token}`);
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error getting user profile:', error);
    next(error);
  }
};

/**
 * Logout user
 */
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      logger.error('Error during logout:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }
    
    logger.info('User logged out');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

module.exports = {
  register,
  login,
  oauthCallback,
  getProfile,
  logout,
};
