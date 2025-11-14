// Export a handler compatible with Vercel's Node.js serverless functions.
// Instead of using `serverless-http` (which returns an AWS Lambda-style
// handler), export a function that forwards the incoming (req, res)
// directly to the Express `app`. The Express `app` is a callable
// function and will handle the request correctly in Vercel's runtime.
const app = require('../server');

module.exports = (req, res) => app(req, res);
