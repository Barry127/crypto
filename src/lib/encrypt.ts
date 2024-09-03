import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { VERSION } from '../index.js';
import { CryptoError } from './cryptoError.js';
import { encodePassphrase } from './encodePassphrase.js';
import { encryptDir } from './encryptDir.js';
import { fileExists } from './fileExists.js';
import { AppendMetadata, encodeMetadata } from './metadata.js';
import { EncryptResult } from './types.js';

export async function encrypt(
  file: string,
  passphrase: string,
  targetDir: string,
  targetFileName?: string
): Promise<EncryptResult> {
  if (!(await fileExists(file)))
    throw new CryptoError(`${file} does not exist`);

  const stat = await fs.promises.lstat(file);
  if (stat.isDirectory()) return encryptDir(file, passphrase, targetDir);
  if (!stat.isFile()) throw new CryptoError(`${file} is not a file`);

  const ext = path.extname(file);
  let target = path.join(
    path.resolve(targetDir),
    targetFileName || `${path.basename(file, ext)}`
  );

  const baseTarget = target;
  let i = 0;
  while (await fileExists(target)) {
    i++;
    target = `${baseTarget}${i++}`;
  }

  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(16);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv(
      'aes-256-ctr',
      encodePassphrase(passphrase),
      iv
    );

    const appendMetadata = new AppendMetadata(
      encodeMetadata({
        ext,
        file: path.basename(file, ext),
        iv,
        version: VERSION
      })
    );

    const input = fs.createReadStream(file);
    const output = fs.createWriteStream(target);

    input.pipe(gzip).pipe(cipher).pipe(appendMetadata).pipe(output);

    output.on('finish', () =>
      resolve({ file, target: path.join(targetDir, path.basename(target)) })
    );

    output.on('error', (err) => {
      reject(new CryptoError(err.message));
    });
  });
}
