import { Transform, TransformCallback } from 'stream';

/**
 * Object-mode: на вход строки БД (объекты), на выход — NDJSON-строки (utf8).
 * Вынесено из контроллера: переиспользование и тестирование без HTTP.
 */
export function createNdjsonRowsTransform(highWaterMark: number): Transform {
  return new Transform({
    objectMode: true,
    highWaterMark,
    transform(
      row: Record<string, unknown>,
      _encoding: BufferEncoding,
      callback: TransformCallback,
    ) {
      try {
        callback(null, JSON.stringify(row) + '\n');
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}
