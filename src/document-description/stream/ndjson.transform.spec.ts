import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { NdjsonTransform } from './ndjson.transform';

describe('NdjsonTransform', () => {
  it('serializes objects to newline-delimited JSON', async () => {
    const input = [{ a: 1 }, { b: 'x' }, { c: true }];
    const src = Readable.from(input, { objectMode: true });
    const ndjson = new NdjsonTransform();

    let output = '';
    const collector = new Writable({
      write(
        chunk: Buffer | string,
        _enc: BufferEncoding,
        cb: (error?: Error | null) => void,
      ) {
        output += chunk.toString();
        cb();
      },
    });

    await pipeline(src, ndjson, collector);

    const lines = output.split('\n').filter(Boolean);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(JSON.stringify(input[0]));
    expect(lines[1]).toBe(JSON.stringify(input[1]));
    expect(lines[2]).toBe(JSON.stringify(input[2]));
    expect(output.endsWith('\n')).toBe(true);
  });
});
