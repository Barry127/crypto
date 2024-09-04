import crypto from 'node:crypto';
import { CryptoError } from './cryptoError.js';

export const META_LENGTH = 512;

export function encodeMetadata(metadata: Metadata): string {
  const noise = Buffer.from(crypto.randomBytes(196)).toString('base64');
  const meta = Buffer.from(JSON.stringify(metadata)).toString('base64');
  return `!${meta}`.padStart(META_LENGTH, noise);
}

export function decodeMetadata(encodedMetadata: string): Metadata {
  if (encodedMetadata.length !== META_LENGTH)
    throw new CryptoError('Invalid metadata length');

  try {
    const base64 = encodedMetadata
      .toString()
      .slice(encodedMetadata.indexOf('!') + 1);
    const json = Buffer.from(base64, 'base64').toString();
    const data = JSON.parse(json);
    data.iv = Buffer.from(data.iv);
    data.tag = Buffer.from(data.tag);
    return data;
  } catch {
    throw new CryptoError('Invalid metadata');
  }
}

export interface Metadata {
  iv: Buffer;
  tag: Buffer;
  file: string;
  ext: string;
  version?: string;
}
