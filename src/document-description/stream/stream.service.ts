import { Injectable } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
import QueryStream from 'pg-query-stream';
import { Readable, Transform, TransformCallback } from 'stream';
import { pipeline } from 'stream/promises';
import type { Request, Response } from 'express';

@Injectable()
export class StreamService {
  private pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

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

  async createDocumentStream(res: Response, req: Request): Promise<void> {
    const client = await this.pool.connect();
    const abortController = new AbortController();

    const query = `
      SELECT system_number, uuid, reg_number, author, title, imprint
      FROM document_description
      ORDER BY system_number
    `;

    const queryStream = new QueryStream(query, [], {
      batchSize: 1000,
    });

    const dbStream = client.query(queryStream) as Readable;
    const releaseState = { released: false };
    const cleanup = () =>
      this.cleanupStream(abortController, dbStream, client, releaseState);

    req.once('aborted', cleanup);
    res.once('close', cleanup);

    res.setHeader('Content-Type', 'application/ndjson');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="export.ndjson"',
    );
    res.setHeader('Transfer-Encoding', 'chunked');
    const ndjsonTransform = new Transform({
      objectMode: true,
      transform(row: any, _enc: BufferEncoding, cb: TransformCallback) {
        cb(null, JSON.stringify(row) + '\n');
      },
    });

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
      res.off('close', cleanup);
    }
  }
}
