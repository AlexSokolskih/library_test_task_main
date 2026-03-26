import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableForSearchIndex1773937055528 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE document_description
        ADD COLUMN search_vector tsvector
      `);

    // индекс для поиска по search_vector
    await queryRunner.query(`
        CREATE INDEX document_description_search_vector_gin_idx 
        ON document_description 
        USING GIN(search_vector)
      `);

    // функция для обновления search_vector, использует и russian и english если в документе есть текст на двух языках
    await queryRunner.query(`
        CREATE FUNCTION document_description_tsvector_update() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            setweight(to_tsvector('russian', coalesce(NEW.author, '')), 'A') ||
            setweight(to_tsvector('russian', coalesce(NEW.title, '')), 'A') ||
            setweight(to_tsvector('russian', coalesce(NEW.imprint, '')), 'B') ||

            setweight(to_tsvector('english', coalesce(NEW.author, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW.imprint, '')), 'B');

          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
      `);

    // триггер для обновления search_vector при вставке или обновлении документа
    await queryRunner.query(`
        CREATE TRIGGER tsvectorupdate
        BEFORE INSERT OR UPDATE ON document_description
        FOR EACH ROW
        EXECUTE FUNCTION document_description_tsvector_update();
      `);

    // обновление search_vector для всех документов которое уже есть в базе данных
    await queryRunner.query(`
        UPDATE document_description
        SET author = author;
      `);

    // отдельныйиндекс для поиска по reg_number
    await queryRunner.query(`
        CREATE INDEX idx_reg_number
        ON document_description (reg_number);
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_reg_number
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tsvectorupdate ON document_description
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS document_description_tsvector_update
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS document_description_search_vector_gin_idx
    `);

    await queryRunner.query(`
      ALTER TABLE document_description
      DROP COLUMN IF EXISTS search_vector
    `);
  }
}
