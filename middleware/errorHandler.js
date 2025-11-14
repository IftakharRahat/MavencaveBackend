const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // If the error is an instance of our custom ApiError, use its properties
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      success: false,
      errors: err.errors,
    });
  }

  // Otherwise, it's an unexpected server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };