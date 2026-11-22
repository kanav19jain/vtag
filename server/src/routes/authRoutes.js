import { Router } from 'express';
import { body } from 'express-validator';
import {
  meController,
  requestOtpController,
  verifyOtpController,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { isValidPhone, normalizePhone } from '../utils/otp.js';

const router = Router();

const phoneRule = body('phone')
  .customSanitizer(normalizePhone)
  .custom(isValidPhone)
  .withMessage('Enter a valid mobile number (10-15 digits)');

router.post('/request-otp', authLimiter, [phoneRule, validate], requestOtpController);

router.post(
  '/verify-otp',
  authLimiter,
  [
    phoneRule,
    body('otp').isString().trim().matches(/^\d{6}$/).withMessage('Enter the 6-digit code'),
    validate,
  ],
  verifyOtpController
);

router.get('/me', protect, meController);

export default router;
