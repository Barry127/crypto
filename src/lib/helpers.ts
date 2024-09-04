import { ReadStream } from 'node:fs';

export async function streamToBuffer(input: ReadStream): Promise<Buffer> {
  const buffers: any[] = [];
  for await (const chunk of input) buffers.push(chunk);
  return Buffer.concat(buffers);
}
