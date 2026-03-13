import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { DocumentDescription } from '../../document-description/document-description.entity';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(DocumentDescription);

    console.log('Seeding DocumentDescription...');

    const documentDescription = repository.create([
      {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        reg_number: '1000000000',
        author: 'John Doe',
        title: 'Document Title',
        imprint: 'Document Imprint',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        reg_number: '1000000001',
        author: 'John Doe1',
        title: 'Document Title1',
        imprint: 'Document Imprint1',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174002',
        reg_number: '1000000002',
        author: 'John Doe2',
        title: 'Document Title2',
        imprint: 'Document Imprint2',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174003',
        reg_number: '1000000003',
        author: 'John Doe3',
        title: 'Document Title3',
        imprint: 'Document Imprint3',
      },
    ]);

    await repository.save(documentDescription);
  }
}
