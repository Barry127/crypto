import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CryptoError } from './cryptoError.js';
import { getMetadata } from './getMetadata.js';

const TEST_DIR = path.join(__dirname, '..', 'test');

describe('getMetadata', () => {
  it('should get metadata', async () => {
    const metadata = await getMetadata(path.join(TEST_DIR, 'e'));

    expect(metadata.file).toBe('e');
    expect(metadata.ext).toBe('.txt');
    expect(metadata.version).toBe('0.4.0');
  });

  it('should throw CryptoError when file does not exist', async () => {
    await expect(
      (async () => getMetadata(path.join(TEST_DIR, 'doesNotExist')))()
    ).rejects.toThrow(CryptoError);
  });

  it('should throw CryptoError when metadata does not exist', async () => {
    await expect(
      (async () => getMetadata(path.join(TEST_DIR, 'file.txt')))()
    ).rejects.toThrow(CryptoError);
  });
});
