import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { compareOtp, generateOtp, hashOtp } from '../utils/otp.js';

/** In-memory OTP store. Intentionally not persisted: this is a dev-only SMS replacement. */
const otpStore = new Map();

const cleanExpired = (now) => {
  for (const [phone, entry] of otpStore) {
    if (entry.expiresAt < now) otpStore.delete(phone);
  }
};

export async function requestOtp(phone) {
  const now = Date.now();
  cleanExpired(now);

  const existing = otpStore.get(phone);
  const retryAfter = existing
    ? Math.ceil((existing.lastSentAt + env.otpResendSeconds * 1000 - now) / 1000)
    : 0;
  if (retryAfter > 0) {
    throw new AppError(`Please wait ${retryAfter}s before requesting a new code`, 429, 'OTP_COOLDOWN', {
      retryAfter,
    });
  }

  const otp = generateOtp();
  const hash = await hashOtp(otp);
  otpStore.set(phone, {
    hash,
    expiresAt: now + env.otpTtlMinutes * 60 * 1000,
    attempts: 0,
    lastSentAt: now,
  });

  return {
    // Never returned in production, even if DEV_OTP_ENABLED is set.
    devOtp: env.devOtpEnabled ? otp : undefined,
    expiresInSeconds: env.otpTtlMinutes * 60,
    resendAfterSeconds: env.otpResendSeconds,
  };
}

export async function verifyOtp(phone, otp) {
  const entry = otpStore.get(phone);
  if (!entry) {
    throw new AppError('Request a code before verifying', 400, 'OTP_NOT_FOUND');
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    throw new AppError('This code has expired. Please request a new one.', 400, 'OTP_EXPIRED');
  }
  if (entry.attempts >= env.otpMaxAttempts) {
    throw new AppError('Too many incorrect attempts. Please request a new code.', 429, 'OTP_MAX_ATTEMPTS');
  }

  entry.attempts += 1;
  const valid = await compareOtp(otp, entry.hash);
  if (!valid) {
    const remaining = Math.max(0, env.otpMaxAttempts - entry.attempts);
    throw new AppError(`Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`, 400, 'OTP_INVALID');
  }

  otpStore.delete(phone);
  return true;
}
