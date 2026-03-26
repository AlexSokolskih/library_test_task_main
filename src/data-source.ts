import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { getDbConnectionConfig } from './database/db.config';

const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  ...getDbConnectionConfig(),
  // автоматически подхватит все *.entity.ts
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  synchronize: false, // для миграций оставляем false
};

// typeorm-extension по умолчанию ищет экспорт с именем dataSource
export const dataSource = new DataSource(dataSourceOptions);
