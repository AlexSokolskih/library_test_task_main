import { Injectable } from '@nestjs/common';
import { DocumentDescription } from './document-description.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable } from 'stream';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';

@Injectable()
export class DocumentDescriptionService {
  constructor(
    @InjectRepository(DocumentDescription)
    private documentDescriptionRepository: Repository<DocumentDescription>,
    private readonly searchService: SearchService,
    private readonly streamService: StreamService,
  ) {}

  async findAll(
    take: number,
    pageNumber: number,
    search?: string,
  ): Promise<DocumentDescription[]> {
    return this.searchService.findAll(take, pageNumber, search);
  }

  async findOne(uuid: string): Promise<DocumentDescription | null> {
    return this.documentDescriptionRepository.findOne({ where: { uuid } });
  }

  async createDocumentStream(): Promise<Readable> {
    //пропускаем линтеры на возвращаемые значения из функции createDocumentStream из-за того что они не типизированы
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.streamService.createDocumentStream();
  }
}
