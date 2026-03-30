import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';

import { DocumentDescriptionController } from '../src/document-description/document-description.controller';
import { DocumentDescriptionService } from '../src/document-description/document-description.service';
import { SearchService } from '../src/document-description/search/search.service';
import { DocumentDescriptionTokenGuard } from '../src/document-description/guards/document-description-token.guard';
import { StreamService } from '../src/document-description/stream/stream.service';

type Doc = {
  system_number: number;
  uuid: string;
  reg_number: string;
  author: string;
  title: string;
  imprint: string;
};

describe('DocumentDescriptions (integration/e2e)', () => {
  let app: INestApplication;
  const testToken = 'change-me';

  const docs: Doc[] = [
    {
      system_number: 2,
      uuid: '11111111-1111-1111-1111-111111111111',
      reg_number: 'REG-2',
      author: 'Иванов',
      title: 'Книга 2',
      imprint: 'Мск',
    },
    {
      system_number: 1,
      uuid: '22222222-2222-2222-2222-222222222222',
      reg_number: 'REG-1',
      author: 'Петров',
      title: 'Книга 1',
      imprint: 'СПб',
    },
  ];

  // Мокаем SearchService напрямую, чтобы не тянуть TypeORM и репозитории
  const searchServiceMock: Partial<SearchService> = {
    async findAll(take: number = 20, pageNumber: number = 1, search?: string) {
      if (!search) {
        const skip = (pageNumber - 1) * take;
        const paged = docs.slice(skip, skip + take);
        return { items: paged, total: docs.length };
      }
      const found = [docs[1]];
      const skip = (pageNumber - 1) * take;
      const paged = found.slice(skip, skip + take);
      return { items: paged, total: found.length };
    },
    async findOne(uuid: string) {
      const row = docs.find((d) => d.uuid === uuid) ?? null;
      if (!row) throw new NotFoundException('Not Found');
      return { data: row } as any;
    },
  };

  const streamMock: Partial<StreamService> = {
    async createDocumentStream(res: any) {
      res.setHeader('Content-Type', 'application/ndjson');
      res.write(JSON.stringify(docs[0]) + '\n');
      res.write(JSON.stringify(docs[1]) + '\n');
      res.end();
    },
  };

  beforeAll(async () => {
    process.env.DOCUMENT_DESCRIPTION_TOKEN = testToken;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DocumentDescriptionController],
      providers: [
        DocumentDescriptionService,
        { provide: SearchService, useValue: searchServiceMock },
        { provide: StreamService, useValue: streamMock },
        { provide: DocumentDescriptionTokenGuard, useValue: { canActivate: () => true } },
      ],
    })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /document-descriptions (JSON, без поиска): отдает data+meta с корректной пагинацией', async () => {
    const res = await request(app.getHttpServer())
      .get('/document-descriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Accept', 'application/json')
      .query({ page: 1, per_page: 2 })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');

    const { data, meta } = res.body;
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(meta).toEqual({
      page: 1,
      per_page: 2,
      total_pages: Math.ceil(docs.length / 2),
      search: null,
    });
  });

  it('GET /document-descriptions (JSON, c поиском): meta.search заполнен, per_page=items.length', async () => {
    const res = await request(app.getHttpServer())
      .get('/document-descriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Accept', 'application/json')
      .query({ page: 1, per_page: 10, search: 'REG-1' })
      .expect(200);

    const { data, meta } = res.body;
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(meta.page).toBe(1);
    expect(meta.per_page).toBe(1);
    expect(meta.total_pages).toBe(1);
    expect(meta.search).toBe('REG-1');
  });

  it('GET /document-descriptions (NDJSON): отдает поток NDJSON', async () => {
    const res = await request(app.getHttpServer())
      .get('/document-descriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Accept', 'application/ndjson')
      .expect(200);

    expect(res.headers['content-type']).toContain('application/ndjson');
    const lines = res.text.trim().split('\n');
    expect(lines.length).toBe(2);
    const parsed0 = JSON.parse(lines[0]);
    const parsed1 = JSON.parse(lines[1]);
    expect(parsed0.uuid).toBe(docs[0].uuid);
    expect(parsed1.uuid).toBe(docs[1].uuid);
  });

  it('GET /document-descriptions/:uuid (найден): возвращает DTO { data: {...} }', async () => {
    const res = await request(app.getHttpServer())
      .get(`/document-descriptions/${docs[0].uuid}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data.uuid).toBe(docs[0].uuid);
  });

  it('GET /document-descriptions/:uuid (не найден): 404', async () => {
    await request(app.getHttpServer())
      .get('/document-descriptions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(404);
  });
});

