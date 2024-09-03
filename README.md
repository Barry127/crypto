# crypto

> File encryption in Nodejs

This package contains functions to encrypt and decrypt files using AES in Node.js.

> [!WARNING]
> Cryptography is hard. A simple mistake can compromise security. I'm by no means an expert on the subject. Use at own risk.

## Install

```bash
npm install @b127/crypto
```

## Usage

```ts
import { encrypt, decrypt } from '@b127/crypto';

(async () => {
  // encrypt file.txt to current directory
  await encrypt('./file.txt', 'passphrase', './');

  // decrypt encryptedFile to current directory
  await decrypt('./encryptedFile', 'passphrase', './');
})();
```

## Types

```ts
interface Metadata {
  iv: Buffer;
  file: string;
  ext: string;
  version?: string;
}

interface ResultEntry {
  file: string;
  target: string;
}

type Result = ResultEntry | ResultEntry[];

interface DecryptToStreamResult {
  metadata: Metadata;
  stream: Stream;
}
```

## API

### encrypt(file, passphrase, targetDir, targetFileName?)

Encrypt a file or directory (non recursive). Returns a `Promise<Result | Result[]>` or rejects `CryptoError`.

#### file

Type: `string`

File or directory to encrypt.

#### passphrase

Type: `string`

Passphrase to use for encryption and decryption.

#### targetDir

Type `string`

Directory to write encrypted file(s) to.

#### targetFileName

Type `string | undefined`\
Default: `undefined`

Name for the encrypted file. When left to undefined the file name will be the input file name without extension.

### decrypt(file, passphrase, targetDir, targetFileName?)

Decrypt a file or directory (non recursive). Returns a `Promise<Result | Result[]>` or rejects `CryptoError`.

#### file

Type: `string`

File or directory to decrypt.

#### passphrase

Type: `string`

Passphrase to use for decryption.

#### targetDir

Type `string`

Directory to write decrypted file(s) to.

#### targetFileName

Type `string | undefined`\
Default: `undefined`

Name for the decrypted file. When left to undefined the filename will be the original filename.

### decryptToStream(file, passphrase)

Decrypt a single file and returns a stream. Returns a `Promise<DecryptToStreamResult>` or rejects `CryptoError`.

#### file

Type: `string`

File to decrypt.

#### passphrase

Type: `string`

Passphrase to use for decryption.

### getMetadata(file)

Get metadata from encrypted file. Returns a `Promise<Metadata>` or rejects `CryptoError`.

#### file

Type: `string`

File to read metadata from.
