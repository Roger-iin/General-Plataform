import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment.validation';
import { User } from '../users/entities/user.entity';

config({ quiet: true });
const environment = validateEnvironment(process.env);

export default new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: environment.DB_PORT,
  username: environment.DB_USER,
  password: environment.DB_PASS,
  database: environment.DB_NAME,
  entities: [User],
  migrations: [`${__dirname}/migrations/[0-9]*{.ts,.js}`],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
  synchronize: false,
});
