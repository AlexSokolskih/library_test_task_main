import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentDescriptionRepository } from './repositories/document-description.repository';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let repo: {
    findPageWithoutSearch: jest.Mock;
    searchManyFullText: jest.Mock;
    findOneByUuid: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findPageWithoutSearch: jest.fn(),
      searchManyFullText: jest.fn(),
      findOneByUuid: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: DocumentDescriptionRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll without search delegates to findPageWithoutSearch with correct skip/take', async () => {
    repo.findPageWithoutSearch.mockResolvedValueOnce({ items: [], total: 0 });
    await expect(service.findAll(20, 3)).resolves.toEqual({ items: [], total: 0 });
    expect(repo.findPageWithoutSearch).toHaveBeenCalledWith(40, 20);
    expect(repo.searchManyFullText).not.toHaveBeenCalled();
  });

  it('findAll with search delegates to searchManyFullText with correct args', async () => {
    repo.searchManyFullText.mockResolvedValueOnce({ items: [{ id: 1 }], total: 1 } as any);
    await expect(service.findAll(10, 2, 'hist')).resolves.toEqual({ items: [{ id: 1 }], total: 1 });
    expect(repo.searchManyFullText).toHaveBeenCalledWith('hist', 10, 10);
    expect(repo.findPageWithoutSearch).not.toHaveBeenCalled();
  });

  it('findOne returns { data } when found', async () => {
    const row = { uuid: 'u1' } as any;
    repo.findOneByUuid.mockResolvedValueOnce(row);
    await expect(service.findOne('u1')).resolves.toEqual({ data: row });
  });

  it('findOne throws NotFoundException when not found', async () => {
    repo.findOneByUuid.mockResolvedValueOnce(null);
    await expect(service.findOne('u1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
