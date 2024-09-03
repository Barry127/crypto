import fs from 'node:fs';
import { CryptoError } from './cryptoError.js';
import { fileExists } from './fileExists.js';
import { decodeMetadata, META_LENGTH, Metadata } from './metadata.js';

export async function getMetadata(file: string): Promise<Metadata> {
  if (!(await fileExists(file)))
    throw new CryptoError(`${file} does not exist`);

  return new Promise((resolve, reject) => {
    const readMetadata = fs.createReadStream(file, { end: META_LENGTH - 1 });

    let metadata: Metadata;

    readMetadata.on('data', (chunk) => {
      try {
        metadata = decodeMetadata(chunk as string);
      } catch (err) {
        reject(err);
      }
    });

    readMetadata.on('error', (err) => {
      reject(new CryptoError(err.message));
    });

    readMetadata.on('close', () => {
      resolve(metadata);
    });
  });
}
