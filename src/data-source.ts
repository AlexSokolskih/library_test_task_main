import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // автоматически подхватит все *.entity.ts
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  synchronize: false, // для миграций оставляем false
};

// typeorm-extension по умолчанию ищет экспорт с именем dataSource
export const dataSource = new DataSource(dataSourceOptions);
