import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentDescription } from './document-description.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';
import type { Request, Response } from 'express';
import { DocumentDescriptionOneResponseDto } from './dto/document-description-one-response.dto';

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
  ): Promise<{ items: DocumentDescription[]; total: number }> {
    return this.searchService.findAll(take, pageNumber, search);
  }

  async findOne(uuid: string): Promise<DocumentDescriptionOneResponseDto> {
    const row = await this.documentDescriptionRepository.findOne({
      where: { uuid },
    });
    if (!row) {
      throw new NotFoundException(`Document with uuid ${uuid} not found`);
    }
    return { data: row };
  }

  async createDocumentStream(res: Response, req: Request): Promise<void> {
    await this.streamService.createDocumentStream(res, req);
  }
}
