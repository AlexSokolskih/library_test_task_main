import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentDescription } from '../document-description.entity';
import { DocumentDescriptionOneResponseDto } from '../dto/document-description-one-response.dto';
import { DocumentDescriptionRepository } from './repositories/document-description.repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly documentDescriptionRepository: DocumentDescriptionRepository,
  ) {}

  async findAll(
    take: number = 20,
    pageNumber: number = 1,
    search?: string,
  ): Promise<{ items: DocumentDescription[]; total: number }> {
    const skip = (pageNumber - 1) * take;

    if (!search) {
      return await this.documentDescriptionRepository.findPageWithoutSearch(
        skip,
        take,
      );
    }

    return this.documentDescriptionRepository.searchManyFullText(
      search,
      skip,
      take,
    );
  }

  async findOne(uuid: string): Promise<DocumentDescriptionOneResponseDto> {
    const row = await this.documentDescriptionRepository.findOneByUuid(uuid);
    if (!row) {
      throw new NotFoundException(`Document with uuid ${uuid} not found`);
    }
    return { data: row };
  }
}
