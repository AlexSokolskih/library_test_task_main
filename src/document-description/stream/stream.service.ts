import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import QueryStream from 'pg-query-stream';
import { Readable } from 'stream';

@Injectable()
export class StreamService {
  private pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  async createDocumentStream(): Promise<Readable> {
    const client = await this.pool.connect();

    const query = `
      SELECT system_number, uuid, reg_number, author, title, imprint
      FROM document_description
      ORDER BY system_number
    `;

    //pg-query-stream типизирован криво и не поддерживает generic types поэтому линтер ругается
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const queryStream = new QueryStream(query, [], {
      batchSize: 1000,
    });

    const dbStream = client.query(queryStream) as Readable;

    dbStream.on('end', () => client.release());
    dbStream.on('error', () => client.release());

    return dbStream;
  }
}
