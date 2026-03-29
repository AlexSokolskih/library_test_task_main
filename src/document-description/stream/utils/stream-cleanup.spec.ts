import {
  cleanupStream,
  releaseClientOnce,
  type ReleaseState,
} from './stream-cleanup';
import type { PoolClient } from 'pg';
import type { Readable } from 'stream';

describe('stream-cleanup utils', () => {
  const createMockClient = (): PoolClient =>
    ({ release: jest.fn() }) as unknown as PoolClient;

  const createMockReadable = (destroyed = false): Readable =>
    ({
      destroyed,
      destroy: jest.fn(function (this: { destroyed: boolean }) {
        this.destroyed = true;
      }),
    }) as unknown as Readable;

  it('releaseClientOnce releases only once', () => {
    const client = createMockClient();
    const state: ReleaseState = { released: false };
    const releaseSpy = jest.spyOn(client, 'release');

    releaseClientOnce(client, state);
    releaseClientOnce(client, state);

    expect(state.released).toBe(true);
    expect(releaseSpy).toHaveBeenCalledTimes(1);
  });

  it('cleanupStream aborts controller, destroys stream and releases client', () => {
    const client = createMockClient();
    const state: ReleaseState = { released: false };
    const dbStream = createMockReadable(false);
    const abortController = new AbortController();
    const abortSpy = jest.spyOn(abortController, 'abort');
    const releaseSpy = jest.spyOn(client, 'release');
    const destroySpy = jest.spyOn(dbStream as any, 'destroy');

    cleanupStream(abortController, dbStream, client, state);

    expect(abortSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(releaseSpy).toHaveBeenCalledTimes(1);
    expect(state.released).toBe(true);
  });

  it('cleanupStream does not call destroy if stream already destroyed', () => {
    const client = createMockClient();
    const state: ReleaseState = { released: false };
    const dbStream = createMockReadable(true);
    const abortController = new AbortController();
    const releaseSpy = jest.spyOn(client, 'release');
    const destroySpy = jest.spyOn(dbStream as any, 'destroy');

    cleanupStream(abortController, dbStream, client, state);

    expect(destroySpy).not.toHaveBeenCalled();
    expect(releaseSpy).toHaveBeenCalledTimes(1);
    expect(state.released).toBe(true);
  });
});
