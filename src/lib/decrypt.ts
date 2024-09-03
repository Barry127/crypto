import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { CryptoError } from './cryptoError.js';
import { decryptDir } from './decryptDir.js';
import { encodePassphrase } from './encodePassphrase.js';
import { fileExists } from './fileExists.js';
import { decodeMetadata, META_LENGTH, Metadata } from './metadata.js';
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

  return new Promise((resolve, reject) => {
    const readMetadata = fs.createReadStream(file, { end: META_LENGTH - 1 });

    let metadata: Metadata;
    let target: string;

    readMetadata.on('data', (chunk) => {
      try {
        metadata = decodeMetadata(chunk as string);
      } catch (err) {
        reject(err);
      }

      const baseTarget = path.join(
        path.resolve(targetDir),
        targetFileName || metadata.file
      );

      target = baseTarget + metadata.ext;
      let i = 0;
      while (fs.existsSync(target)) {
        target = `${baseTarget}${i++}${metadata.ext}`;
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
      const output = fs.createWriteStream(target);

      input.pipe(decipher).pipe(unzip).pipe(output);

      output.on('finish', () =>
        resolve({ file, target: path.join(targetDir, path.basename(target)) })
      );

      decipher.on('error', (err) => {
        fs.unlinkSync(target);
        reject(new CryptoError(err.message));
      });

      unzip.on('error', (err) => {
        fs.unlinkSync(target);
        reject(new CryptoError(err.message));
      });

      output.on('error', (err) => {
        fs.unlinkSync(target);
        reject(new CryptoError(err.message));
      });
    });

    readMetadata.on('error', (err) => {
      reject(new CryptoError(err.message));
    });
  });
}
