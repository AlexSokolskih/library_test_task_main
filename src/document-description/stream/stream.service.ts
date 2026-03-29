import { Injectable } from '@nestjs/common';
import QueryStream from 'pg-query-stream';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { Request, Response } from 'express';
import { StreamPoolProvider } from './stream-pool.provider';
import { NdjsonTransform } from './ndjson.transform';
import { cleanupStream, releaseClientOnce } from './utils/stream-cleanup';

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
      cleanupStream(abortController, dbStream, client, releaseState);
    const onClose = () => {
      if (!res.writableFinished) {
        cleanup();
      }
    };

    req.once('aborted', cleanup);
    res.once('close', onClose);

    this.setStreamHeaders(res);
    const ndjsonTransform = new NdjsonTransform(200);

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
        releaseClientOnce(client, releaseState);
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

  // release/cleanup вынесены в ./utils/stream-cleanup
}
