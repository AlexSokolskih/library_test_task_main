import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { getPgPoolConfig } from '../../database/db.config';

@Injectable()
export class StreamPoolProvider implements OnApplicationShutdown {
  readonly pool: Pool;

  constructor() {
    this.pool = new Pool(getPgPoolConfig());
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
