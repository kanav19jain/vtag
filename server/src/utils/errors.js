export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', extra = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.assign(this, extra);
    Error.captureStackTrace?.(this, AppError);
  }
}

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
