import crypto from 'node:crypto';

/** URL-safe, cryptographically random public identifier, e.g. vt_7fK2pQ9xLm3R. */
export function generateTagId() {
  return `vt_${crypto.randomBytes(12).toString('base64url')}`;
}

export function generatePublicId() {
  return crypto.randomUUID();
}
