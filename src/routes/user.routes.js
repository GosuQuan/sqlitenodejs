/**
 * User routes
 */
const express = require('express');
const userController = require('../controllers/user.controller');
const { validate } = require('../middlewares/validation');
const { updateUserSchema } = require('../utils/validation-schemas');
const { authenticateJWT, authorizeRole } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Get all users (admin only)
router.get('/', authorizeRole(['admin']), userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', validate(updateUserSchema), userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
