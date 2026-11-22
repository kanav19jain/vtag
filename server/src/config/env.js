import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const env = {
  nodeEnv,
  isProduction,
  port: asNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vtag',
  jwtSecret: process.env.JWT_SECRET || 'vtag-dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, ''),

  // OTP is shown in the response only for local development.
  devOtpEnabled: asBoolean(process.env.DEV_OTP_ENABLED, true) && !isProduction,
  otpTtlMinutes: asNumber(process.env.OTP_TTL_MINUTES, 5),
  otpResendSeconds: asNumber(process.env.OTP_RESEND_SECONDS, 60),
  otpMaxAttempts: asNumber(process.env.OTP_MAX_ATTEMPTS, 5),

  telephonyProvider: process.env.TELEPHONY_PROVIDER || 'mock',
  mockCallFailureRate: Math.min(1, Math.max(0, asNumber(process.env.MOCK_CALL_FAILURE_RATE, 0.15))),
};

if (isProduction && (!process.env.JWT_SECRET || env.jwtSecret.startsWith('vtag-dev-only'))) {
  console.warn('[vtag] WARNING: JWT_SECRET is not set to a strong value in production.');
}
