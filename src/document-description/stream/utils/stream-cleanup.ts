import type { Readable } from 'stream';
import type { PoolClient } from 'pg';

export type ReleaseState = { released: boolean };

export function releaseClientOnce(
  client: PoolClient,
  state: ReleaseState,
): void {
  if (state.released) {
    return;
  }
  state.released = true;
  client.release();
}

export function cleanupStream(
  abortController: AbortController,
  dbStream: Readable,
  client: PoolClient,
  state: ReleaseState,
): void {
  abortController.abort();

  if (!dbStream.destroyed) {
    dbStream.destroy();
  }

  releaseClientOnce(client, state);
}
