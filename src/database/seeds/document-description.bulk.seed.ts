import { DataSource } from 'typeorm';
import { Seeder, SeederFactory, SeederFactoryManager } from 'typeorm-extension';
import { DocumentDescription } from '../../document-description/document-description.entity';

const DEFAULT_TOTAL = 1_000_000;
const DEFAULT_BATCH_SIZE = 10_000;
// В PostgreSQL лимит ~65535 параметров на один запрос.
// У нас 5 колонок на запись (uuid, reg_number, author, title, imprint).
// Безопасный лимит строк на один INSERT:
const MAX_PARAMS_PER_QUERY = 65000;
const COLUMNS_PER_ROW = 5;
const MAX_ROWS_PER_INSERT = Math.floor(MAX_PARAMS_PER_QUERY / COLUMNS_PER_ROW); // ~13000

export default class DocumentDescriptionBulkSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(DocumentDescription);
    const factory: SeederFactory<DocumentDescription> =
      factoryManager.get(DocumentDescription);

    const total = Number(process.env.BULK_SEED_TOTAL ?? DEFAULT_TOTAL);
    const batchSize = Number(process.env.BULK_SEED_BATCH ?? DEFAULT_BATCH_SIZE);

    if (!Number.isFinite(total) || total <= 0) {
      throw new Error('BULK_SEED_TOTAL must be a positive number');
    }
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      throw new Error('BULK_SEED_BATCH must be a positive number');
    }

    console.log(
      `Bulk seeding DocumentDescription: total=${total}, batch=${batchSize}`,
    );

    let inserted = 0;

    while (inserted < total) {
      // ограничиваем батч как env-значением, так и безопасным лимитом для PG
      const currentBatchSize = Math.min(
        batchSize,
        total - inserted,
        MAX_ROWS_PER_INSERT,
      );
      const items: DocumentDescription[] = [];
      for (let i = 0; i < currentBatchSize; i++) {
        // factory.make() создает сущность без сохранения
        const entity = await factory.make();
        items.push(entity);
      }

      await repository
        .createQueryBuilder()
        .insert()
        .into(DocumentDescription)
        .values(items)
        .orIgnore()
        .execute();

      inserted += currentBatchSize;

      if (inserted % (batchSize * 5) === 0 || inserted === total) {
        console.log(`Inserted ${inserted}/${total}`);
      }
    }
  }
}
