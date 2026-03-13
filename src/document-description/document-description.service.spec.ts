import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDescriptionService } from './document-description.service';

describe('DocumentDescriptionService', () => {
  let service: DocumentDescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentDescriptionService],
    }).compile();

    service = module.get<DocumentDescriptionService>(
      DocumentDescriptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
