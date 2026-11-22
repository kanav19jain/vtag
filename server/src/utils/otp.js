import crypto from 'node:crypto';
import bcrypt from 'bcrypt';

/** Cryptographically random 6-digit OTP, always zero-padded to length 6. */
export function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp, hash) {
  return bcrypt.compare(String(otp), hash);
}

/** Accept +, spaces and dashes; store digits only (10-15 digits). */
export function normalizePhone(raw) {
  if (typeof raw !== 'string') return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return digits;
}

export const isValidPhone = (phone) => /^\d{10,15}$/.test(phone);

export const maskPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `••••••${digits.slice(-4)}`;
};

/** Stable, non-reversible identifier for analytics (visitor IPs are never stored raw). */
export const hashIp = (ip, secret) =>
  crypto.createHmac('sha256', secret).update(String(ip || 'unknown')).digest('hex').slice(0, 32);
