import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CryptoError } from './cryptoError.js';
import { decrypt } from './decrypt.js';
import { fileExists } from './fileExists.js';

const TEST_DIR = path.join(__dirname, '..', 'test');
const TARGET_DIR = path.join(TEST_DIR, 'decryptTarget');

describe('decrypt', () => {
  beforeAll(async () => {
    await fs.promises.mkdir(TARGET_DIR);
  });

  afterAll(async () => {
    await fs.promises.rm(TARGET_DIR, { recursive: true });
  });

  it('should decrypt a file', async () => {
    expect(await fileExists(path.join(TARGET_DIR, 'e.txt'))).toBe(false);
    await decrypt(path.join(TEST_DIR, 'e'), 'password', TARGET_DIR);
    expect(await fileExists(path.join(TARGET_DIR, 'e.txt'))).toBe(true);

    const decryptedContent = await fs.promises.readFile(
      path.join(TARGET_DIR, 'e.txt')
    );
    expect(decryptedContent.toString()).toEqual('Super Secret');
  });

  it('should decrypt a file with a targetName', async () => {
    expect(await fileExists(path.join(TARGET_DIR, 'targetFileName'))).toBe(
      false
    );
    await decrypt(
      path.join(TEST_DIR, 'e'),
      'password',
      TARGET_DIR,
      'targetFileName'
    );
    expect(await fileExists(path.join(TARGET_DIR, 'targetFileName.txt'))).toBe(
      true
    );
  });

  it('should throw CryptoError when file does not exist', async () => {
    await expect(
      (async () =>
        decrypt(path.join(TEST_DIR, 'doesNotExist'), 'password', TARGET_DIR))()
    ).rejects.toThrow(CryptoError);
  });
});
