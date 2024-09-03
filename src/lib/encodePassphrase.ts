import crypto from 'node:crypto';

export function encodePassphrase(passphrase: string): string {
  return crypto
    .createHash('sha256')
    .update(passphrase)
    .digest('base64')
    .slice(0, 32);
}
