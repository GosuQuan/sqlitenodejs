/**
 * API Routes index
 */
const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
