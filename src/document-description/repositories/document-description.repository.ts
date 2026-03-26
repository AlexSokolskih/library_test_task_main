import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentDescription } from '../document-description.entity';

/**
 * Слой репозитория: вся работа с БД по сущности.
 * Вынесено из «сервиса поиска», чтобы разделить доменный сервис и доступ к данным (ТЗ: слои controller / service / repository).
 */
@Injectable()
export class DocumentDescriptionRepository {
  constructor(
    @InjectRepository(DocumentDescription)
    private readonly documentDescriptionRepository: Repository<DocumentDescription>,
  ) {}

  /**
   * Постраничная выборка с опциональным FTS.
   * Сортировка всегда по system_number DESC — явное требование ТЗ для списка.
   */

  async findPageWithoutSearch(
    skip: number,
    take: number,
  ): Promise<{ items: DocumentDescription[]; total: number }> {
    const [items, total] =
      await this.documentDescriptionRepository.findAndCount({
        order: {
          system_number: 'DESC',
        },
        skip,
        take,
      });
    return { items, total };
  }

  async searchManyFullText(
    search: string,
    skip: number,
    take: number,
  ): Promise<{ items: DocumentDescription[]; total: number }> {
    const prefixQuery = this.toPrefixTsQuery(search);
    if (!prefixQuery) {
      return this.findPageWithoutSearch(skip, take);
    }

    const queryBuilder =
      this.documentDescriptionRepository.createQueryBuilder('d');

    // поиск по полнотекстовому индексу и точного совпадения по reg_number
    queryBuilder.where(
      `
          d.search_vector @@ (
            to_tsquery('russian', :prefixQuery) ||
            to_tsquery('english', :prefixQuery)
          )
          OR d.reg_number = :exact
        `,
      {
        prefixQuery,
        exact: search,
      },
    );
    console.log('prefixQuery', prefixQuery);

    // приоритет точного совпадения
    queryBuilder
      .addOrderBy(
        `
        CASE 
          WHEN LOWER(d.reg_number) = LOWER(:exact) THEN 1
          ELSE 2
        END
        `,
        'ASC',
      )
      .setParameter('exact', search);

    // ранжирование по релевантности
    queryBuilder.addOrderBy(
      `
          ts_rank(
            d.search_vector,
            to_tsquery('russian', :prefixQuery) ||
            to_tsquery('english', :prefixQuery)
          )
        `,
      'DESC',
    );

    queryBuilder.skip(skip).take(take);
    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  /**
   * Префиксный tsquery (слово:* & слово2:*) для подстрочного поиска.
   * Спецсимволы tsquery экранируем — иначе ввод ломает запрос или открывает вектор инъекций.
   */
  private toPrefixTsQuery(input: string): string | null {
    const words = input
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
      .filter(Boolean);
    if (words.length === 0) {
      return null;
    }
    return words.map((word) => `${word}:*`).join(' & ');
  }
}
