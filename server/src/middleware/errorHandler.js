import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong';
  let code = error.code || 'INTERNAL_ERROR';
  const extras = {};

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
    code = 'INVALID_ID';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((e) => e.message).join(', ');
    code = 'VALIDATION_ERROR';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with these details already exists';
    code = 'DUPLICATE';
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid session. Please sign in again.';
    code = 'INVALID_TOKEN';
  }

  if (error.field) extras.field = error.field;
  if (error.retryAfter) extras.retryAfter = error.retryAfter;

  if (statusCode >= 500 && !env.isProduction) {
    console.error('[vtag] Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, code, ...extras },
    // Keep the legacy flat shape as a convenience for clients.
    message,
  });
};
