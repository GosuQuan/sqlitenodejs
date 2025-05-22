/**
 * User controller
 */
const { models } = require('../models');
const logger = require('../utils/logger');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ['password'] },
    });
    
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error getting all users:', error);
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await models.User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error getting user by ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    
    // Check if user exists
    const user = await models.User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure users can only update their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      logger.warn(`User ${req.user.id} attempted to update user ${id}`);
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Only admins can change roles
    const updates = { username, email };
    if (req.user.role === 'admin' && role) {
      updates.role = role;
    }
    
    // Update user
    await user.update(updates);
    
    logger.info(`User ${id} updated`);
    
    // Return updated user (exclude password)
    const updatedUser = await models.User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await models.User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure users can only delete their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      logger.warn(`User ${req.user.id} attempted to delete user ${id}`);
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }
    
    // Delete user
    await user.destroy();
    
    logger.info(`User ${id} deleted`);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
