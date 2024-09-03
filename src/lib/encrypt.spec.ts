import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CryptoError } from './cryptoError.js';
import { decrypt } from './decrypt.js';
import { encrypt } from './encrypt.js';
import { fileExists } from './fileExists.js';

const TEST_DIR = path.join(__dirname, '..', 'test');
const TARGET_DIR = path.join(TEST_DIR, 'encryptTarget');

describe('encrypt', () => {
  beforeAll(async () => {
    await fs.promises.mkdir(TARGET_DIR);
  });

  afterAll(async () => {
    await fs.promises.rm(TARGET_DIR, { recursive: true });
  });

  it('should encrypt a file', async () => {
    const decryptedContent = await fs.promises.readFile(
      path.join(TEST_DIR, 'file.txt')
    );

    expect(await fileExists(path.join(TARGET_DIR, 'file'))).toBe(false);
    await encrypt(path.join(TEST_DIR, 'file.txt'), 'password', TARGET_DIR);
    expect(await fileExists(path.join(TARGET_DIR, 'file'))).toBe(true);

    const encryptedContent = await fs.promises.readFile(
      path.join(TARGET_DIR, 'file')
    );

    expect(encryptedContent).not.toEqual(decryptedContent);

    await decrypt(path.join(TARGET_DIR, 'file'), 'password', TARGET_DIR);
    expect(await fileExists(path.join(TARGET_DIR, 'file.txt'))).toBe(true);
    const newDecryptedContent = await fs.promises.readFile(
      path.join(TARGET_DIR, 'file.txt')
    );
    expect(newDecryptedContent).toEqual(decryptedContent);
  });

  it('should encrypt a file with a targetName', async () => {
    expect(await fileExists(path.join(TARGET_DIR, 'targetFileName'))).toBe(
      false
    );
    await encrypt(
      path.join(TEST_DIR, 'file.txt'),
      'password',
      TARGET_DIR,
      'targetFileName'
    );
    expect(await fileExists(path.join(TARGET_DIR, 'targetFileName'))).toBe(
      true
    );
  });

  it('should throw CryptoError when file does not exist', async () => {
    await expect(
      (async () =>
        encrypt(path.join(TEST_DIR, 'doesNotExist'), 'password', TARGET_DIR))()
    ).rejects.toThrow(CryptoError);
  });
});
