import crypto from 'node:crypto';
import { Transform, TransformCallback, TransformOptions } from 'node:stream';
import { CryptoError } from './cryptoError.js';

export const META_LENGTH = 256;

export class AppendMetadata extends Transform {
  #metadata: string;
  #appended: boolean;

  constructor(metadata: string, opts?: TransformOptions) {
    super(opts);

    if (metadata.length !== META_LENGTH)
      throw new CryptoError('Invalid metadata length');

    this.#metadata = metadata;
    this.#appended = false;
  }

  override _transform(
    chunk: any,
    _encoding: string,
    callback: TransformCallback
  ): void {
    if (!this.#appended) {
      this.push(this.#metadata);
      this.#appended = true;
    }

    this.push(chunk);
    callback();
  }
}

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
    return data;
  } catch {
    throw new CryptoError('Invalid metadata');
  }
}

export interface Metadata {
  iv: Buffer;
  file: string;
  ext: string;
  version?: string;
}
