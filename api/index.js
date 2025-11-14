const serverless = require('serverless-http');
const app = require('../server');

// Export a serverless-compatible handler for Vercel
module.exports = serverless(app);
