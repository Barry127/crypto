import fs from 'node:fs';
import path from 'node:path';
import { CryptoError } from './cryptoError.js';
import { decrypt } from './decrypt.js';
import { fileExists } from './fileExists.js';
import { DecryptResult, DecryptResultEntry } from './types.js';

export async function decryptDir(
  dir: string,
  passphrase: string,
  targetDir: string
): Promise<DecryptResult> {
  if (!(await fileExists(dir))) throw new CryptoError(`${dir} does not exist`);

  const stat = await fs.promises.lstat(dir);
  if (stat.isFile()) decrypt(dir, passphrase, targetDir);
  if (!stat.isDirectory()) throw new CryptoError(`${dir} is not a directory`);

  const ls = await fs.promises.readdir(dir);
  return Promise.all(
    ls
      .map((file) => path.join(dir, file))
      .filter((file) => fs.lstatSync(file).isFile())
      .map(
        (file) =>
          decrypt(file, passphrase, targetDir) as Promise<DecryptResultEntry>
      )
  );
}
