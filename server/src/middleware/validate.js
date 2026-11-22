import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const first = errors.array()[0];
  return next(new AppError(first.msg || 'Invalid input', 400, 'VALIDATION_ERROR', {
    field: first.path || first.param,
  }));
};
