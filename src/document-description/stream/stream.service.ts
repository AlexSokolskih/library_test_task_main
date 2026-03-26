import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import QueryStream from 'pg-query-stream';
import { Readable, Transform, TransformCallback } from 'stream';
import { pipeline } from 'stream/promises';
import type { Request, Response } from 'express';
import { StreamPoolProvider } from './stream-pool.provider';

@Injectable()
export class StreamService {
  private static readonly ALL_DOCUMENTS_QUERY = `
    SELECT system_number, uuid, reg_number, author, title, imprint
    FROM document_description
    ORDER BY system_number
  `;

  constructor(private readonly streamPoolProvider: StreamPoolProvider) {}

  async createDocumentStream(res: Response, req: Request): Promise<void> {
    const client = await this.streamPoolProvider.pool.connect();
    const abortController = new AbortController();

    const queryStream = new QueryStream(StreamService.ALL_DOCUMENTS_QUERY, [], {
      batchSize: 1000,
    });

    const dbStream = client.query(queryStream) as Readable;
    const releaseState = { released: false };
    const cleanup = () =>
      this.cleanupStream(abortController, dbStream, client, releaseState);
    const onClose = () => {
      if (!res.writableFinished) {
        cleanup();
      }
    };

    req.once('aborted', cleanup);
    res.once('close', onClose);

    this.setStreamHeaders(res);
    const ndjsonTransform = this.createNdjsonTransform();

    let completed = false;
    try {
      await pipeline(dbStream, ndjsonTransform, res, {
        signal: abortController.signal,
      });
      completed = true;
    } catch (err) {
      if ((err as { name?: string }).name !== 'AbortError') {
        console.error('stream error', err);
      }
    } finally {
      if (completed) {
        this.releaseClientOnce(client, releaseState);
      } else {
        cleanup();
      }
      req.off('aborted', cleanup);
      res.off('close', onClose);
    }
  }

  private setStreamHeaders(res: Response): void {
    res.setHeader('Content-Type', 'application/ndjson');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="export.ndjson"',
    );
    res.setHeader('Transfer-Encoding', 'chunked');
  }

  private createNdjsonTransform(): Transform {
    return new Transform({
      objectMode: true,
      highWaterMark: 200,
      transform(row: any, _enc: BufferEncoding, cb: TransformCallback) {
        cb(null, JSON.stringify(row) + '\n');
      },
    });
  }

  private releaseClientOnce(
    client: PoolClient,
    state: { released: boolean },
  ): void {
    if (state.released) {
      return;
    }

    state.released = true;
    client.release();
  }

  private cleanupStream(
    abortController: AbortController,
    dbStream: Readable,
    client: PoolClient,
    state: { released: boolean },
  ): void {
    abortController.abort();

    if (!dbStream.destroyed) {
      dbStream.destroy();
    }

    this.releaseClientOnce(client, state);
  }
}
