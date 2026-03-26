import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773347427275 implements MigrationInterface {
  name = 'Migration1773347427275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "document_description" ("system_number" SERIAL NOT NULL, "uuid" uuid NOT NULL, "reg_number" character varying(20) NOT NULL, "author" character varying(200) NOT NULL, "title" character varying(500) NOT NULL, "imprint" character varying(300) NOT NULL, CONSTRAINT "UQ_a0bd1189e2086794cb0c5f8bb71" UNIQUE ("uuid"), CONSTRAINT "PK_4ee725460f8d6c5026bffd1ab5a" PRIMARY KEY ("system_number"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "document_description"`);
  }
}
