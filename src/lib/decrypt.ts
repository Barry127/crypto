import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import zlib from 'node:zlib';
import { CryptoError } from './cryptoError.js';
import { decryptDir } from './decryptDir.js';
import { encodePassphrase } from './encodePassphrase.js';
import { fileExists } from './fileExists.js';
import { decodeMetadata, META_LENGTH } from './metadata.js';
import { DecryptResult } from './types.js';

export async function decrypt(
  file: string,
  passphrase: string,
  targetDir: string,
  targetFileName?: string
): Promise<DecryptResult> {
  if (!(await fileExists(file)))
    throw new CryptoError(`${file} does not exist`);

  const stat = await fs.promises.lstat(file);
  if (stat.isDirectory()) return decryptDir(file, passphrase, targetDir);
  if (!stat.isFile()) throw new CryptoError(`${file} is not a file`);

  const readMetadata = fs.createReadStream(file, { end: META_LENGTH - 1 });
  const buffers: any[] = [];
  for await (const chunk of readMetadata) buffers.push(chunk);

  try {
    const metadata = decodeMetadata(Buffer.concat(buffers).toString());
    const baseTarget = path.join(
      path.resolve(targetDir),
      targetFileName || metadata.file
    );

    let target = baseTarget + metadata.ext;
    let i = 0;
    while (fs.existsSync(target)) {
      target = `${baseTarget}${i++}${metadata.ext}`;
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      encodePassphrase(passphrase),
      metadata.iv
    );
    decipher.setAuthTag(metadata.tag);
    const unzip = zlib.createUnzip();
    const input = fs.createReadStream(file, { start: META_LENGTH });
    const output = fs.createWriteStream(target);

    await pipeline(input, decipher, unzip, output);
    return { file, target: path.join(targetDir, path.basename(target)) };
  } catch (err: any) {
    throw new CryptoError(err.message);
  }
}
