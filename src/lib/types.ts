import { Stream } from 'node:stream';
import { Metadata } from './metadata.js';

export interface DecryptResultEntry {
  file: string;
  target: string;
}

export type DecryptResult = DecryptResultEntry | DecryptResultEntry[];

export interface DecryptToStreamResult {
  metadata: Metadata;
  stream: Stream;
}

export interface EncryptResultEntry {
  file: string;
  target: string;
}

export type EncryptResult = EncryptResultEntry | EncryptResultEntry[];
