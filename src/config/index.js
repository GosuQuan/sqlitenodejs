/**
 * Configuration loader
 * Loads the appropriate configuration based on the NODE_ENV environment variable
 */
const config = require('config');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// 配置已经放在项目根目录的config文件夹中，config包会自动加载

module.exports = config;
