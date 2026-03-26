import { ApiProperty } from '@nestjs/swagger';

/** Мета пагинации и поиска — форма ответа из ТЗ (page, per_page, total_pages, search). */
export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Количество элементов на текущей странице (фактическое).',
  })
  per_page: number;

  @ApiProperty({
    example: 5,
    description:
      'Всего страниц при текущем per_page из запроса (0, если записей нет).',
  })
  total_pages: number;

  @ApiProperty({
    example: 'история',
    nullable: true,
    description:
      'Переданный query `search` или `null`, если параметр не задан.',
  })
  search: string | null;
}
