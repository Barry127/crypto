import crypto from 'node:crypto';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { CryptoError } from './cryptoError.js';
import { encodePassphrase } from './encodePassphrase.js';
import { fileExists } from './fileExists.js';
import { decodeMetadata, META_LENGTH, Metadata } from './metadata.js';
import { DecryptToStreamResult } from './types.js';

export async function decryptToStream(
  file: string,
  passphrase: string
): Promise<DecryptToStreamResult> {
  if (!(await fileExists(file)))
    throw new CryptoError(`${file} does not exist`);

  const stat = await fs.promises.lstat(file);
  if (!stat.isFile()) throw new CryptoError(`${file} is not a file`);

  return new Promise<DecryptToStreamResult>((resolve, reject) => {
    const readMetadata = fs.createReadStream(file, { end: META_LENGTH - 1 });
    let metadata: Metadata;

    readMetadata.on('data', (chunk) => {
      try {
        metadata = decodeMetadata(chunk as string);
      } catch (err) {
        reject(err);
      }
    });

    readMetadata.on('close', () => {
      const decipher = crypto.createDecipheriv(
        'aes-256-ctr',
        encodePassphrase(passphrase),
        metadata.iv
      );
      const unzip = zlib.createUnzip();
      const input = fs.createReadStream(file, { start: META_LENGTH });

      resolve({
        metadata,
        stream: input.pipe(decipher).pipe(unzip)
      });
    });

    readMetadata.on('error', (err) => {
      reject(new CryptoError(err.message));
    });
  });
}
