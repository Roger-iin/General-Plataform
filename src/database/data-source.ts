import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

config({ quiet: true });

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`A variável de ambiente ${name} é obrigatória.`);
  }

  return value;
}

function getDatabasePort(): number {
  const value = getRequiredEnvironmentVariable('DB_PORT');
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(
      'A variável de ambiente DB_PORT deve ser uma porta válida.',
    );
  }

  return port;
}

export default new DataSource({
  type: 'postgres',
  host: getRequiredEnvironmentVariable('DB_HOST'),
  port: getDatabasePort(),
  username: getRequiredEnvironmentVariable('DB_USER'),
  password: getRequiredEnvironmentVariable('DB_PASS'),
  database: getRequiredEnvironmentVariable('DB_NAME'),
  entities: [User],
  migrations: [`${__dirname}/migrations/[0-9]*{.ts,.js}`],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
  synchronize: false,
});
