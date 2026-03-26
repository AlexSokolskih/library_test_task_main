import { Injectable } from '@nestjs/common';
import { DocumentDescription } from './document-description.entity';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';
import type { Request, Response } from 'express';
import { DocumentDescriptionOneResponseDto } from './dto/document-description-one-response.dto';

@Injectable()
export class DocumentDescriptionService {
  constructor(
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
    return this.searchService.findOne(uuid);
  }

  async createDocumentStream(res: Response, req: Request): Promise<void> {
    await this.streamService.createDocumentStream(res, req);
  }
}
