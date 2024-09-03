import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
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
  const tmpFile = path.resolve(
    os.tmpdir(),
    crypto.randomBytes(16).toString('hex')
  );

  const baseTarget = target;
  let i = 0;
  while (await fileExists(target)) {
    i++;
    target = `${baseTarget}${i++}`;
  }

  try {
    const iv = crypto.randomBytes(16);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      encodePassphrase(passphrase),
      iv
    );

    await pipeline(
      fs.createReadStream(file),
      gzip,
      cipher,
      fs.createWriteStream(tmpFile)
    );

    const appendMetadata = new AppendMetadata(
      encodeMetadata({
        ext,
        file: path.basename(file, ext),
        tag: cipher.getAuthTag(),
        iv,
        version: VERSION
      })
    );
    await pipeline(
      fs.createReadStream(tmpFile),
      appendMetadata,
      fs.createWriteStream(target)
    );
    await fs.promises.unlink(tmpFile);
    return { file, target: path.join(targetDir, path.basename(target)) };
  } catch (err: any) {
    if (await fileExists(target)) await fs.promises.unlink(target);
    if (await fileExists(tmpFile)) await fs.promises.unlink(tmpFile);
    throw new CryptoError(err.message);
  }
}
