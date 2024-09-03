export class CryptoError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, CryptoError.prototype);
  }
}
