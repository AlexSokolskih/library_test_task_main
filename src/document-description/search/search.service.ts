import { Injectable } from '@nestjs/common';
import { DocumentDescription } from '../document-description.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(DocumentDescription)
    private documentDescriptionRepository: Repository<DocumentDescription>,
  ) {}

  async findAll(
    take: number = 20,
    pageNumber: number = 1,
    search?: string,
  ): Promise<DocumentDescription[]> {
    const skip = (pageNumber - 1) * take;

    if (!search) {
      return await this.paginationWithOutSearch(skip, take);
    }

    return this.getDocumentsFullTextSearch(search, take, skip);
  }

  private async paginationWithOutSearch(skip: number, take: number) {
    const result = await this.documentDescriptionRepository.find({
      order: {
        system_number: 'DESC',
      },
      skip,
      take,
    });
    console.log('result', result);
    return result;
  }

  private toPrefixTsQuery(input: string): string {
    return input
      .trim()
      .split(/\s+/)
      .map((word) => `${word}:*`)
      .join(' & ');
  }

  private async getDocumentsFullTextSearch(
    search: string,
    take: number,
    skip: number,
  ): Promise<DocumentDescription[]> {
    const queryBuilder =
      this.documentDescriptionRepository.createQueryBuilder('d');
    const prefixQuery = this.toPrefixTsQuery(search);

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
    return await queryBuilder.getMany();
  }
}
