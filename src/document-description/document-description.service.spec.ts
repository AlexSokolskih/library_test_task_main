import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDescriptionService } from './document-description.service';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';

describe('DocumentDescriptionService', () => {
  let service: DocumentDescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentDescriptionService,
        {
          provide: SearchService,
          useValue: {},
        },
        {
          provide: StreamService,
          useValue: {},
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
});
