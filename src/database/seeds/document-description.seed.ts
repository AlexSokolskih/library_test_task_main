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
      {
        uuid: '123e4567-e89b-12d3-a456-426614174004',
        reg_number: '1000000004',
        author: 'John Doe4',
        title: 'Document Title4',
        imprint: 'Document Imprint4',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174005',
        reg_number: '1000000005',
        author: 'John Doe5',
        title: 'Document Title5',
        imprint: 'Document Imprint5',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174006',
        reg_number: '1000000006',
        author: 'John Doe6',
        title: 'Document Title6',
        imprint: 'Document Imprint6',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174007',
        reg_number: '1000000007',
        author: 'John Doe7',
        title: 'Document Title7',
        imprint: 'Document Imprint7',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174008',
        reg_number: '1000000008',
        author: 'John Doe8',
        title: 'Document Title8',
        imprint: 'Document Imprint8',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174009',
        reg_number: '1000000009',
        author: 'John Doe9',
        title: 'Document Title9',
        imprint: 'Document Imprint9',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174010',
        reg_number: '1000000010',
        author: 'John Doe10',
        title: 'Document Title10',
        imprint: 'Document Imprint10',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174011',
        reg_number: '1000000011',
        author: 'John Doe11',
        title: 'Document Title11',
        imprint: 'Document Imprint11',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174012',
        reg_number: '1000000012',
        author: 'John Doe12',
        title: 'Document Title12',
        imprint: 'Document Imprint12',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174013',
        reg_number: '1000000013',
        author: 'John Doe13',
        title: 'Document Title13',
        imprint: 'Document Imprint13',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174014',
        reg_number: '1000000014',
        author: 'John Doe14',
        title: 'Document Title14',
        imprint: 'Document Imprint14',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174015',
        reg_number: '1000000015',
        author: 'John Doe15',
        title: 'Document Title15',
        imprint: 'Document Imprint15',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174016',
        reg_number: '1000000016',
        author: 'John Doe16',
        title: 'Document Title16',
        imprint: 'Document Imprint16',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174017',
        reg_number: '1000000017',
        author: 'John Doe17',
        title: 'Document Title17',
        imprint: 'Document Imprint17',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174018',
        reg_number: '1000000018',
        author: 'John Doe18',
        title: 'Document Title18',
        imprint: 'Document Imprint18',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174019',
        reg_number: '1000000019',
        author: 'John Doe19',
        title: 'Document Title19',
        imprint: 'Document Imprint19',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174020',
        reg_number: '1000000020',
        author: 'John Doe20',
        title: 'Document Title20',
        imprint: 'Document Imprint20',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174021',
        reg_number: '1000000021',
        author: 'John Doe21',
        title: 'Document Title21',
        imprint: 'Document Imprint21',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174022',
        reg_number: '1000000022',
        author: 'John Doe22',
        title: 'Document Title22',
        imprint: 'Document Imprint22',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174023',
        reg_number: '1000000023',
        author: 'John Doe23',
        title: 'Document Title23',
        imprint: 'Document Imprint23',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174024',
        reg_number: '1000000024',
        author: 'John Doe24',
        title: 'Document Title24',
        imprint: 'Document Imprint24',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174025',
        reg_number: '1000000025',
        author: 'John Doe25',
        title: 'Document Title25',
        imprint: 'Document Imprint25',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174026',
        reg_number: '1000000026',
        author: 'John Doe26',
        title: 'Document Title26',
        imprint: 'Document Imprint26',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174027',
        reg_number: '1000000027',
        author: 'John Doe27',
        title: 'Document Title27',
        imprint: 'Document Imprint27',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174028',
        reg_number: '1000000028',
        author: 'John Doe28',
        title: 'Document Title28',
        imprint: 'Document Imprint28',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174029',
        reg_number: '1000000029',
        author: 'John Doe29',
        title: 'Document Title29',
        imprint: 'Document Imprint29',
      },
    ]);

    await repository.save(documentDescription);
  }
}
