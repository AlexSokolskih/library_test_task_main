import { ApiProperty } from '@nestjs/swagger';
import { DocumentDescription } from '../document-description.entity';
import { PaginationMetaDto } from './pagination-meta.dto';

/** Корневой объект списка: data + meta, как в ТЗ. */
export class PaginatedDocumentDescriptionsResponseDto {
  @ApiProperty({ type: [DocumentDescription] })
  data: DocumentDescription[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
