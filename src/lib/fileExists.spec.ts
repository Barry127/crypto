import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileExists } from './fileExists.js';

const TEST_DIR = path.join(__dirname, '..', 'test');

describe('fileExists', () => {
  it('should return true when the file exists', async () => {
    const filePath = path.join(TEST_DIR, 'file.txt');
    const result = await fileExists(filePath);
    expect(result).toBe(true);
  });

  it('should return true when the directory exists', async () => {
    const filePath = path.join(TEST_DIR);
    const result = await fileExists(filePath);
    expect(result).toBe(true);
  });

  it('should return false for non-existing file', async () => {
    const filePath = path.join(TEST_DIR, 'does_not_exist');
    const result = await fileExists(filePath);
    expect(result).toBe(false);
  });
});
