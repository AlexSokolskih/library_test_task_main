import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDescriptionController } from './document_description.controller';

describe('DocumentDescriptionController', () => {
  let controller: DocumentDescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentDescriptionController],
    }).compile();

    controller = module.get<DocumentDescriptionController>(DocumentDescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
