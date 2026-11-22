import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Owner } from '../models/Owner.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError('Session expired or invalid. Please sign in again.', 401, 'INVALID_TOKEN');
  }

  const owner = await Owner.findById(decoded.id).select('-__v');
  if (!owner) {
    throw new AppError('Account not found. Please sign in again.', 401, 'OWNER_NOT_FOUND');
  }

  req.owner = owner;
  next();
});
