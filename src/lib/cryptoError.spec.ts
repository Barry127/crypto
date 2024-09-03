import { describe, expect, it } from 'vitest';
import { CryptoError } from './cryptoError.js';

describe('cryptoError', () => {
  it('should create an instance with a message when message is provided', () => {
    const message = 'An error occurred';
    const error = new CryptoError(message);
    expect(error).toBeInstanceOf(CryptoError);
    expect(error.message).toBe(message);
  });

  it('should create an instance without a message when no message is provided', () => {
    const error = new CryptoError();
    expect(error).toBeInstanceOf(CryptoError);
    expect(error.message).toBe('');
  });

  it('should inherit from the Error class', () => {
    const error = new CryptoError();
    expect(error).toBeInstanceOf(Error);
  });
});
