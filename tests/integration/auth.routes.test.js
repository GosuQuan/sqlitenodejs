/**
 * Integration tests for authentication routes
 */
const request = require('supertest');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

// Mock config
jest.mock('../../src/config', () => ({
  get: jest.fn((key) => {
    const config = {
      'jwt.secret': 'test_jwt_secret',
      'jwt.expiresIn': '1h',
      'session.secret': 'test_session_secret',
      'session.resave': false,
      'session.saveUninitialized': false,
      'session.cookie.secure': false,
      'database.path': ':memory:',
      'database.logging': false,
    };
    return config[key];
  }),
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('Authentication Routes', () => {
  let app;
  let sequelize;
  let User;
  
  beforeAll(async () => {
    // Setup in-memory database
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
    
    // Initialize User model
    const UserModel = require('../../src/models/user');
    User = UserModel(sequelize);
    
    // Sync database
    await sequelize.sync({ force: true });
    
    // Create express app
    app = express();
    app.use(express.json());
    
    // Setup passport
    app.use(passport.initialize());
    
    // Mock passport local strategy
    passport.use('local', {
      name: 'local',
      authenticate: (req, options) => {
        return async (req, res, next) => {
          const { email, password } = req.body;
          
          try {
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
              return res.status(401).json({ message: 'Incorrect email.' });
            }
            
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
              return res.status(401).json({ message: 'Incorrect password.' });
            }
            
            req.user = user;
            next();
          } catch (error) {
            next(error);
          }
        };
      },
    });
    
    // Setup routes
    const authRoutes = require('../../src/routes/auth.routes');
    app.use('/api/auth', authRoutes);
    
    // Error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  beforeEach(async () => {
    // Clear users before each test
    await User.destroy({ where: {} });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify user was created in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
    });
    
    it('should return 409 if user already exists', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });
      
      // Try to register with same email
      const userData = {
        username: 'newusername',
        email: 'existing@example.com',
        password: 'newpassword',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(409);
      
      expect(response.body).toHaveProperty('message', 'User already exists with this email');
    });
    
    it('should validate input data', async () => {
      // Missing required fields
      const invalidData = {
        username: 'testuser',
        // missing email and password
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
