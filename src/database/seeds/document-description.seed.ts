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
        author: 'Иван Петров',
        title: 'Архитектура распределенных систем',
        imprint: 'Москва: ТехноПресс, 2021. 384 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        reg_number: '1000000001',
        author: 'Anna Volkova',
        title: 'Practical TypeScript for Enterprise Apps',
        imprint: 'Saint Petersburg: North Wind Books, 2023. 312 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174002',
        reg_number: '1000000002',
        author: 'Сергей Алексеев',
        title: 'Введение в анализ данных на Python',
        imprint: 'Казань: Университетская книга, 2020. 256 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174003',
        reg_number: '1000000003',
        author: 'Мария Смирнова',
        title: 'Каталог редких изданий Российской империи',
        imprint: 'Москва: БиблиоФонд, 2019. 198 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174004',
        reg_number: '1000000004',
        author: 'Oleg Kuznetsov',
        title: 'Node.js Patterns in Production',
        imprint: 'Novosibirsk: Siberian IT Press, 2022. 428 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174005',
        reg_number: '1000000005',
        author: 'Елена Громова',
        title: 'Современная библиотечная аналитика',
        imprint: 'Екатеринбург: УралПринт, 2021. 274 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174006',
        reg_number: '1000000006',
        author: 'Pavel Andreev',
        title: 'Indexing and Metadata Engineering',
        imprint: 'Moscow: Data Shelf Publishing, 2024. 336 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174007',
        reg_number: '1000000007',
        author: 'Наталья Орлова',
        title: 'История книжного дела в России',
        imprint: 'Ярославль: Волга-Бук, 2018. 410 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174008',
        reg_number: '1000000008',
        author: 'Dmitry Belov',
        title: 'PostgreSQL Query Optimization Handbook',
        imprint: 'Perm: Backend House, 2023. 290 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174009',
        reg_number: '1000000009',
        author: 'Ольга Лебедева',
        title: 'Электронные коллекции: проектирование и сопровождение',
        imprint: 'Самара: ПрофБиблио, 2022. 248 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174010',
        reg_number: '1000000010',
        author: 'Kirill Mikhailov',
        title: 'Microservices Reliability Playbook',
        imprint: 'Minsk: Eastern Tech Editions, 2021. 360 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174011',
        reg_number: '1000000011',
        author: 'Андрей Соколов',
        title: 'Правовое регулирование цифровых библиотек',
        imprint: 'Москва: ЮрИнфо, 2020. 186 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174012',
        reg_number: '1000000012',
        author: 'Irina Danilova',
        title: 'API Design for Public Catalogs',
        imprint: 'Kazan: Open Library Lab, 2024. 222 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174013',
        reg_number: '1000000013',
        author: 'Галина Тихонова',
        title: 'Методика предметизации документов',
        imprint: 'Воронеж: АкадемКнига, 2019. 301 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174014',
        reg_number: '1000000014',
        author: 'Roman Fedorov',
        title: 'Clean Architecture with NestJS',
        imprint: 'Saint Petersburg: Hexagonal Press, 2023. 344 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174015',
        reg_number: '1000000015',
        author: 'Татьяна Егорова',
        title: 'Справочник библиотекаря: стандарты и практика',
        imprint: 'Нижний Новгород: ПрофКнига, 2022. 275 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174016',
        reg_number: '1000000016',
        author: 'Yulia Morozova',
        title: 'Full-Text Search Systems: From Theory to Ops',
        imprint: 'Rostov-on-Don: SearchLine, 2021. 398 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174017',
        reg_number: '1000000017',
        author: 'Виктор Крылов',
        title: 'Организация фондов научной библиотеки',
        imprint: 'Томск: Сибирский университет, 2018. 342 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174018',
        reg_number: '1000000018',
        author: 'Artem Zaitsev',
        title: 'Data Pipelines for Cultural Heritage Repositories',
        imprint: 'Moscow: Streamforge, 2025. 266 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174019',
        reg_number: '1000000019',
        author: 'Светлана Никифорова',
        title: 'Библиографическое описание: практический курс',
        imprint: 'Саратов: Научная среда, 2020. 214 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174020',
        reg_number: '1000000020',
        author: 'Maxim Orlov',
        title: 'Event-Driven Catalog Services',
        imprint: 'Ufa: Async Media, 2024. 287 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174021',
        reg_number: '1000000021',
        author: 'Людмила Абрамова',
        title: 'Книгохранилище XXI века: технологии и люди',
        imprint: 'Омск: БиблиоТех, 2021. 319 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174022',
        reg_number: '1000000022',
        author: 'Denis Vinogradov',
        title: 'Testing Strategies for Backend Platforms',
        imprint: 'Chelyabinsk: QA Press, 2023. 240 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174023',
        reg_number: '1000000023',
        author: 'Ирина Беляева',
        title: 'Каталогизация периодических изданий',
        imprint: 'Пермь: РегионКнига, 2019. 233 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174024',
        reg_number: '1000000024',
        author: 'Vera Sokol',
        title: 'Information Retrieval Metrics Explained',
        imprint: 'Moscow: Metric House, 2022. 176 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174025',
        reg_number: '1000000025',
        author: 'Павел Романов',
        title: 'Управление цифровыми архивами',
        imprint: 'Санкт-Петербург: АрхивПлюс, 2021. 294 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174026',
        reg_number: '1000000026',
        author: 'Alina Petrova',
        title: 'REST and GraphQL in Library Platforms',
        imprint: 'Krasnodar: South Byte Press, 2024. 305 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174027',
        reg_number: '1000000027',
        author: 'Николай Морозов',
        title: 'Ретроконверсия карточных каталогов',
        imprint: 'Новосибирск: СибКаталог, 2018. 267 с.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174028',
        reg_number: '1000000028',
        author: 'Egor Tarasov',
        title: 'Observability for Data-Intensive Services',
        imprint: 'Yekaterinburg: Telemetry Books, 2025. 352 p.',
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174029',
        reg_number: '1000000029',
        author: 'Ксения Филиппова',
        title: 'Семантические модели в библиотечных системах',
        imprint: 'Москва: Онтология, 2023. 228 с.',
      },
    ]);

    await repository
      .createQueryBuilder()
      .insert()
      .into(DocumentDescription)
      .values(documentDescription)
      .orIgnore()
      .execute();
  }
}
