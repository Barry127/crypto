import fs from 'node:fs';
import { CryptoError } from './cryptoError.js';
import { fileExists } from './fileExists.js';
import { streamToBuffer } from './helpers.js';
import { decodeMetadata, META_LENGTH, Metadata } from './metadata.js';

export async function getMetadata(file: string): Promise<Metadata> {
  if (!(await fileExists(file)))
    throw new CryptoError(`${file} does not exist`);

  try {
    const { size } = await fs.promises.stat(file);
    const readMetadata = fs.createReadStream(file, {
      start: size - META_LENGTH
    });

    const metaBuffer = await streamToBuffer(readMetadata);
    return decodeMetadata(metaBuffer.toString());
  } catch (err: any) {
    throw new CryptoError(err.message);
  }
}
