import { Test } from '@nestjs/testing';
import { DocumentDescriptionController } from './document-description.controller';
import { DocumentDescriptionService } from './document-description.service';
import type { Request, Response } from 'express';

describe('DocumentDescriptionController', () => {
  let controller: DocumentDescriptionController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    createDocumentStream: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      createDocumentStream: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [DocumentDescriptionController],
      providers: [{ provide: DocumentDescriptionService, useValue: service }],
    }).compile();

    controller = module.get(DocumentDescriptionController);
  });

  it('returns JSON when Accept != ndjson', async () => {
    const req = {
      headers: { accept: 'application/json' },
    } as unknown as Request;
    const res = { json: jest.fn((v: unknown) => v) } as unknown as Response;

    const items = [{ id: 1 }];
    service.findAll.mockResolvedValue({ items, total: 10 });

    const expected = {
      data: items,
      meta: {
        page: 2,
        per_page: items.length,
        total_pages: Math.ceil(10 / 5),
        search: 'q',
      },
    };

    const result = await controller.findAll(req, res, {
      per_page: 5,
      page: 2,
      search: 'q',
    } as any);

    expect(service.findAll).toHaveBeenCalledWith(5, 2, 'q');
    expect(res.json).toHaveBeenCalledWith(expected);
    expect(result).toEqual(expected);
  });

  it('streams when Accept includes ndjson', async () => {
    const req = { headers: { accept: 'application/ndjson' } };
    const res = {};

    await controller.findAll(req as any, res as any, {} as any);

    expect(service.createDocumentStream).toHaveBeenCalledWith(res, req);
  });
});
