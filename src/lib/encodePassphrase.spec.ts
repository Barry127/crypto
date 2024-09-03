import { describe, expect, it } from 'vitest';
import { encodePassphrase } from './encodePassphrase.js';

describe('encodePassphrase', () => {
  it('should return a 32-character base64 encoded string when given a simple passphrase', () => {
    const passphrase = 'simplePassphrase';
    const encoded = encodePassphrase(passphrase);
    expect(encoded).toHaveLength(32);
    expect(encoded).toMatch(/^[A-Za-z0-9+/=]{32}$/);
  });

  it('should return a 32-character base64 encoded string when given an empty passphrase', () => {
    const passphrase = '';
    const encoded = encodePassphrase(passphrase);
    expect(encoded).toHaveLength(32);
    expect(encoded).toMatch(/^[A-Za-z0-9+/=]{32}$/);
  });

  it('should return the same encoded passphrase for the same input', () => {
    const passphrase = 'mySecretPassphrase';
    const encoded1 = encodePassphrase(passphrase);
    const encoded2 = encodePassphrase(passphrase);
    expect(encoded1).toEqual(encoded2);
  });
});
