import rateLimit from 'express-rate-limit';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again shortly.', code: 'RATE_LIMITED' },
};

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

export const callLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 40,
});
