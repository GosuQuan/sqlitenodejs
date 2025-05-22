/**
 * Validation schemas for API requests
 */
const Joi = require('joi');

// User registration schema
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// User login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// User update schema
const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  role: Joi.string().valid('user', 'admin'),
}).min(1); // At least one field must be provided

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
};
