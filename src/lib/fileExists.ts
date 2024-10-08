import fs from 'node:fs/promises';

export async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
