import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CryptoError } from './cryptoError.js';
import { decryptToStream } from './decryptToStream.js';

const TEST_DIR = path.join(__dirname, '..', 'test');

describe('decryptToStream', () => {
  it('should decrypt a file to a stream', async () => {
    const { metadata, stream } = await decryptToStream(
      path.join(TEST_DIR, 'e'),
      'password'
    );

    expect(metadata.file).toBe('e');
    expect(metadata.ext).toBe('.txt');
    expect(metadata.version).toBe('0.4.0');

    let contents = await new Promise<string>((resolve) => {
      const buffs: any[] = [];
      stream.on('data', (buff) => buffs.push(buff));
      stream.on('end', () => {
        resolve(Buffer.concat(buffs).toString());
      });
    });

    expect(contents).toBe('Super Secret');
  });

  it('should throw CryptoError when file does not exist', async () => {
    await expect(
      (async () =>
        decryptToStream(path.join(TEST_DIR, 'doesNotExist'), 'password'))()
    ).rejects.toThrow(CryptoError);
  });
});
