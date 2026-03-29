import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDescriptionService } from './document-description.service';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';
import type { Request, Response } from 'express';

describe('DocumentDescriptionService', () => {
  let service: DocumentDescriptionService;
  let searchService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };
  let streamService: {
    createDocumentStream: jest.Mock;
  };

  beforeEach(async () => {
    searchService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    streamService = {
      createDocumentStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentDescriptionService,
        {
          provide: SearchService,
          useValue: searchService,
        },
        {
          provide: StreamService,
          useValue: streamService,
        },
      ],
    }).compile();

    service = module.get<DocumentDescriptionService>(
      DocumentDescriptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('delegates findAll to SearchService', async () => {
    const result = { items: [], total: 0 };
    searchService.findAll.mockResolvedValueOnce(result);

    await expect(service.findAll(10, 2, 'term')).resolves.toEqual(result);
    expect(searchService.findAll).toHaveBeenCalledWith(10, 2, 'term');
  });

  it('delegates findOne to SearchService', async () => {
    const result = { data: { uuid: 'u-1' } };
    searchService.findOne.mockResolvedValueOnce(result);

    await expect(service.findOne('u-1')).resolves.toEqual(result);
    expect(searchService.findOne).toHaveBeenCalledWith('u-1');
  });

  it('delegates createDocumentStream to StreamService', async () => {
    streamService.createDocumentStream.mockResolvedValueOnce(undefined);
    const req = {} as Request;
    const res = {} as Response;

    await expect(
      service.createDocumentStream(res, req),
    ).resolves.toBeUndefined();
    expect(streamService.createDocumentStream).toHaveBeenCalledWith(res, req);
  });
});
