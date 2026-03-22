import { Injectable } from '@nestjs/common';
import { DocumentDescription } from './document-description.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Readable } from 'stream';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';

@Injectable()
export class DocumentDescriptionService {
  constructor(
    @InjectRepository(DocumentDescription)
    private documentDescriptionRepository: Repository<DocumentDescription>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly searchService: SearchService,
    private readonly streamService: StreamService,
  ) {}

  async findAll(
    take: number,
    pageNumber: number,
    search?: string,
  ): Promise<DocumentDescription[]> {
    console.log('findAll');
    return this.searchService.findAll(take, pageNumber, search);
  }

  async findOne(uuid: string): Promise<DocumentDescription | null> {
    return this.documentDescriptionRepository.findOne({ where: { uuid } });
  }

  async createDocumentStream(): Promise<Readable> {
    const svc = this.streamService as unknown as {
      createDocumentStream: () => Promise<Readable>;
    };
    const stream = await svc.createDocumentStream();
    return stream;
  }
}
