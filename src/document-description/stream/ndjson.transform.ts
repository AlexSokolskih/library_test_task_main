import { Transform, TransformCallback } from 'stream';

export class NdjsonTransform<Row = unknown> extends Transform {
  constructor(highWaterMark = 200) {
    super({ objectMode: true, highWaterMark });
  }

  _transform(row: Row, _enc: BufferEncoding, cb: TransformCallback): void {
    cb(null, JSON.stringify(row) + '\n');
  }
}
