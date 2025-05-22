/**
 * Authentication routes
 */
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation');
const { registerSchema, loginSchema } = require('../utils/validation-schemas');
const { authenticateJWT } = require('../middlewares/auth');

const router = express.Router();

// Register new user
router.post('/register', validate(registerSchema), authController.register);

// Login with email and password
router.post('/login', validate(loginSchema), passport.authenticate('local', { session: false }), authController.login);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), authController.oauthCallback);

// Get current user profile (requires authentication)
router.get('/profile', authenticateJWT, authController.getProfile);

// Logout
router.post('/logout', authenticateJWT, authController.logout);

// OAuth success page (for frontend to extract token)
router.get('/success', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Authentication Successful</title>
        <script>
          // Extract token from URL
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          
          // Store token in localStorage
          if (token) {
            localStorage.setItem('authToken', token);
            document.getElementById('message').textContent = 'Authentication successful! You can close this window.';
          } else {
            document.getElementById('message').textContent = 'Authentication failed. No token received.';
          }
        </script>
      </head>
      <body>
        <h1>Authentication Successful</h1>
        <p id="message">Processing authentication...</p>
      </body>
    </html>
  `);
});

module.exports = router;
