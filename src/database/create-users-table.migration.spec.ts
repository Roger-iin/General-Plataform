import type { QueryRunner } from 'typeorm';
import { CreateUsersTable1752700000000 } from './migrations/1752700000000-CreateUsersTable';

describe('CreateUsersTable1752700000000', () => {
  const query = jest.fn().mockResolvedValue(undefined);
  const queryRunner = { query } as unknown as QueryRunner;
  const migration = new CreateUsersTable1752700000000();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create the UUID extension and users table', async () => {
    await migration.up(queryRunner);

    expect(query).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenNthCalledWith(
      1,
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    );
    expect(query.mock.calls[1][0]).toContain('CREATE TABLE "users"');
    expect(query.mock.calls[1][0]).toContain('CONSTRAINT "UQ_users_email"');
    expect(query.mock.calls[1][0]).toContain('PRIMARY KEY ("id")');
  });

  it('should drop the users table when reverted', async () => {
    await migration.down(queryRunner);

    expect(query).toHaveBeenCalledWith('DROP TABLE "users"');
  });
});
