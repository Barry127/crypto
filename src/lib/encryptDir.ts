import fs from 'node:fs';
import path from 'node:path';
import { CryptoError } from './cryptoError.js';
import { encrypt } from './encrypt.js';
import { fileExists } from './fileExists.js';
import { EncryptResult, EncryptResultEntry } from './types.js';

export async function encryptDir(
  dir: string,
  passphrase: string,
  targetDir: string
): Promise<EncryptResult> {
  if (!(await fileExists(dir))) throw new CryptoError(`${dir} does not exist`);

  const stat = await fs.promises.lstat(dir);
  if (stat.isFile()) return encrypt(dir, passphrase, targetDir);
  if (!stat.isDirectory()) throw new CryptoError(`${dir} is not a directory`);

  const ls = await fs.promises.readdir(dir);
  return Promise.all(
    ls
      .map((file) => path.join(dir, file))
      .filter((file) => fs.lstatSync(file).isFile())
      .map(
        (file) =>
          encrypt(file, passphrase, targetDir) as Promise<EncryptResultEntry>
      )
  );
}
