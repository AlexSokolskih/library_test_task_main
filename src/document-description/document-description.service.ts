import { Injectable } from '@nestjs/common';
import { DocumentDescription } from './document-description.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import QueryStream from 'pg-query-stream';
import { Readable } from 'stream';
import { Pool } from 'pg';
import { SearchService } from './search/search.service';

@Injectable()
export class DocumentDescriptionService {
  constructor(
    @InjectRepository(DocumentDescription)
    private documentDescriptionRepository: Repository<DocumentDescription>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly searchService: SearchService,
  ) {}

  private pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

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
    const client = await this.pool.connect();

    const query = `
      SELECT system_number, uuid, reg_number, author, title, imprint
      FROM document_description
      ORDER BY system_number
    `;

    const queryStream = new QueryStream(query, [], { batchSize: 2 });
    const dbStream = client.query(queryStream);

    dbStream.on('end', () => client.release());
    dbStream.on('error', () => client.release());

    return dbStream;
  }
}
