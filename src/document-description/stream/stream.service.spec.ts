import { Test, TestingModule } from '@nestjs/testing';
import { StreamPoolProvider } from './stream-pool.provider';
import { StreamService } from './stream.service';

describe('StreamService', () => {
  let service: StreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
        {
          provide: StreamPoolProvider,
          useValue: {
            pool: {},
          },
        },
      ],
    }).compile();

    service = module.get<StreamService>(StreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
