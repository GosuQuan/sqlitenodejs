/**
 * Request validation middleware using Joi
 */
const logger = require('../utils/logger');

/**
 * Creates a validation middleware for a specific schema
 * @param {Object} schema - Joi schema for validation
 * @param {String} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (!error) {
      next();
    } else {
      const { details } = error;
      const message = details.map(i => i.message).join(',');
      
      logger.warn(`Validation error: ${message}`);
      res.status(400).json({
        error: 'Validation Error',
        details: message
      });
    }
  };
};

module.exports = {
  validate
};
