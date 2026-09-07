import crypto from 'crypto';

export function createOrnamentCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}
