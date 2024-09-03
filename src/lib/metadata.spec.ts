import { describe, expect, it } from 'vitest';
import { CryptoError } from './cryptoError.js';
import {
  AppendMetadata,
  decodeMetadata,
  encodeMetadata,
  META_LENGTH
} from './metadata.js';

describe('metadata', () => {
  describe('AppendMetadata', () => {
    it('should append metadata once when transforming chunks', async () => {
      let resolve: () => void;
      const metadata = 'a'.repeat(META_LENGTH);
      const appendMetadata = new AppendMetadata(metadata);
      const chunks = ['chunk1', 'chunk2'];
      const result: string[] = [];

      appendMetadata.on('data', (chunk) => {
        result.push(chunk.toString());
      });

      appendMetadata.on('end', () => {
        expect(result).toEqual([metadata, ...chunks]);
        resolve();
      });

      chunks.forEach((chunk) => appendMetadata.write(chunk));
      appendMetadata.end();

      return new Promise<void>((_resolve) => {
        resolve = _resolve;
      });
    });

    it('should throw CryptoError when metadata length is invalid', () => {
      const invalidMetadata = 'invalid_length';
      expect(() => new AppendMetadata(invalidMetadata)).toThrow(CryptoError);
    });
  });

  describe('encodeMetadata', () => {
    it('should encode metadata object into a base64 string', () => {
      const metadata = {
        iv: Buffer.from('1234567890123456'),
        tag: Buffer.from('1234567890123456'),
        file: 'example.txt',
        ext: 'txt',
        version: '1.0'
      };
      const encoded = encodeMetadata(metadata);
      expect(encoded).toMatch(/^[A-Za-z0-9+/!]+={0,2}$/);
      expect(encoded.length).toBe(META_LENGTH);
    });

    it('should use random bytes for padding', () => {
      const metadata = {
        iv: Buffer.from('1234567890123456'),
        tag: Buffer.from('1234567890123456'),
        file: 'example.txt',
        ext: 'txt',
        version: '1.0'
      };
      const encoded1 = encodeMetadata(metadata);
      const encoded2 = encodeMetadata(metadata);
      expect(encoded1).not.toBe(encoded2);

      const end = encoded1.slice(encoded1.indexOf('!'));
      expect(encoded2.endsWith(end)).toBe(true);
    });
  });

  describe('decodeMetadata', () => {
    it('should decode valid encoded metadata string to Metadata object', () => {
      const metadata = {
        iv: Buffer.from('1234567890123456'),
        tag: Buffer.from('1234567890123456'),
        file: 'example.txt',
        ext: 'txt',
        version: '1.0'
      };
      const encodedMetadata = encodeMetadata(metadata);

      const result = decodeMetadata(encodedMetadata);
      expect(result).toEqual(metadata);
    });

    it('should throw CryptoError when encoded metadata string has incorrect length', () => {
      const invalidEncodedMetadata = 'shortString';
      expect(() => decodeMetadata(invalidEncodedMetadata)).toThrow(CryptoError);
      expect(() => decodeMetadata(invalidEncodedMetadata)).toThrow(
        'Invalid metadata length'
      );
    });

    it('should throw CryptoError for invalid JSON structure in metadata', () => {
      const encodedMetadata =
        '6eUO0B22yCQ8GI7kzYGH47PTIUWUuqQ75+peaNEEeayNP+ELbcezC9uw6WtlravqdaQXjmI4vciKVQMUNCxZE5ocVpa/9op178Df/ZVDCs8n48xsxtFebd07vb8QmBxaebVXqKnRwX08HGnTTenE4ggTmvReYmDrAv7HhybT0yFDTNlnOOm1l6kSD9qMIeMLpoBDXzasrA7PcYxz3L3ERBQF338G5E9UcRvKivTBh8VIhhP!aW52YWxpZEpTT04=';
      expect(() => decodeMetadata(encodedMetadata)).toThrow(CryptoError);
      expect(() => decodeMetadata(encodedMetadata)).toThrow('Invalid metadata');
    });
  });
});
