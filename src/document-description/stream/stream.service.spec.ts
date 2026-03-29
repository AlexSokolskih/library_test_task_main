import { Test } from '@nestjs/testing';
import { StreamService } from './stream.service';
import { StreamPoolProvider } from './stream-pool.provider';
import { pipeline } from 'stream/promises';

jest.mock('stream/promises', () => ({
  pipeline: jest.fn(),
}));

describe('StreamService', () => {
  let service: StreamService;
  let mockClient: any;

  const createDbStream = () => {
    const stream = {
      destroyed: false,
      destroy: jest.fn(() => {
        stream.destroyed = true;
      }),
    };
    return stream;
  };

  const createReq = () => {
    const handlers: Record<string, () => void> = {};
    return {
      once: jest.fn((e, cb) => (handlers[e] = cb)),
      off: jest.fn(),
      emit: (e: 'aborted') => handlers[e]?.(),
    } as any;
  };

  const createRes = () => {
    const handlers: Record<string, () => void> = {};
    return {
      setHeader: jest.fn(),
      once: jest.fn((e, cb) => (handlers[e] = cb)),
      off: jest.fn(),
      writableFinished: false,
      emit: (e: 'close') => handlers[e]?.(),
    } as any;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        StreamService,
        {
          provide: StreamPoolProvider,
          useValue: {
            pool: {
              connect: jest.fn().mockResolvedValue(mockClient),
            },
          },
        },
      ],
    }).compile();

    service = module.get(StreamService);
  });

  it('sets headers and runs pipeline', async () => {
    const req = createReq();
    const res = createRes();

    mockClient.query.mockReturnValue(createDbStream());
    (pipeline as jest.Mock).mockResolvedValue(undefined);

    await service.createDocumentStream(res, req);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/ndjson',
    );
    expect(pipeline).toHaveBeenCalled();
  });

  it('cleans up on req.aborted', async () => {
    const req = createReq();
    const res = createRes();
    const dbStream = createDbStream();

    mockClient.query.mockReturnValue(dbStream);
    (pipeline as jest.Mock).mockImplementation(() => new Promise(() => {}));

    service.createDocumentStream(res, req);
    await Promise.resolve();

    req.emit('aborted');

    expect(dbStream.destroy).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('cleans up on res.close', async () => {
    const req = createReq();
    const res = createRes();
    const dbStream = createDbStream();

    mockClient.query.mockReturnValue(dbStream);
    (pipeline as jest.Mock).mockImplementation(() => new Promise(() => {}));

    service.createDocumentStream(res, req);
    await Promise.resolve();

    res.emit('close');

    expect(dbStream.destroy).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('releases client once on success', async () => {
    const req = createReq();
    const res = createRes();

    mockClient.query.mockReturnValue(createDbStream());
    (pipeline as jest.Mock).mockResolvedValue(undefined);

    await service.createDocumentStream(res, req);

    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('ignores AbortError', async () => {
    const req = createReq();
    const res = createRes();

    mockClient.query.mockReturnValue(createDbStream());
    (pipeline as jest.Mock).mockRejectedValue({ name: 'AbortError' });

    await expect(
      service.createDocumentStream(res, req),
    ).resolves.toBeUndefined();
  });
});