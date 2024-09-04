import crypto from 'node:crypto';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { CryptoError } from './cryptoError.js';
import { encodePassphrase } from './encodePassphrase.js';
import { fileExists } from './fileExists.js';
import { getMetadata } from './getMetadata.js';
import { META_LENGTH } from './metadata.js';
import { DecryptToStreamResult } from './types.js';

export async function decryptToStream(
  file: string,
  passphrase: string
): Promise<DecryptToStreamResult> {
  if (!(await fileExists(file)))
    throw new CryptoError(`${file} does not exist`);

  const stat = await fs.promises.lstat(file);
  if (!stat.isFile()) throw new CryptoError(`${file} is not a file`);

  try {
    const metadata = await getMetadata(file);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      encodePassphrase(passphrase),
      metadata.iv
    );
    decipher.setAuthTag(metadata.tag);
    const unzip = zlib.createUnzip();
    const { size } = await fs.promises.stat(file);
    const input = fs.createReadStream(file, { end: size - META_LENGTH - 1 });

    return { metadata, stream: input.pipe(decipher).pipe(unzip) };
  } catch (err: any) {
    throw new CryptoError(err.message);
  }
}
