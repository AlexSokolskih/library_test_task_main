import { ApiProperty } from '@nestjs/swagger';
import { DocumentDescription } from '../document-description.entity';

/** Ответ «одна сущность»: обёртка { data }, как в ТЗ. */
export class DocumentDescriptionOneResponseDto {
  @ApiProperty({ type: DocumentDescription })
  data: DocumentDescription;
}
