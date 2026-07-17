import { validateEnvironment } from './environment.validation';

describe('validateEnvironment', () => {
  const validEnvironment = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'user',
    DB_PASS: 'password',
    DB_NAME: 'database',
    JWT_SECRET: 'a'.repeat(64),
    JWT_EXPIRATION: '1d',
  };

  it('should validate and normalize the environment', () => {
    const result = validateEnvironment(validEnvironment);

    expect(result).toMatchObject({ ...validEnvironment, DB_PORT: 5432 });
  });

  it.each(['0', '65536', 'invalid', '1.5'])(
    'should reject invalid database port %s',
    (port) => {
      expect(() =>
        validateEnvironment({ ...validEnvironment, DB_PORT: port }),
      ).toThrow('DB_PORT deve ser um número inteiro entre 1 e 65535.');
    },
  );

  it('should reject a weak JWT secret', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, JWT_SECRET: 'short-secret' }),
    ).toThrow('JWT_SECRET deve possuir pelo menos 64 caracteres.');
  });

  it.each(['1 minute', '0s', '30s', '31d', 'forever'])(
    'should reject invalid JWT expiration %s',
    (expiration) => {
      expect(() =>
        validateEnvironment({
          ...validEnvironment,
          JWT_EXPIRATION: expiration,
        }),
      ).toThrow('JWT_EXPIRATION');
    },
  );

  it('should report all missing required variables at once', () => {
    expect(() => validateEnvironment({})).toThrow(
      /DB_HOST[\s\S]*DB_PORT[\s\S]*DB_USER[\s\S]*DB_PASS[\s\S]*DB_NAME[\s\S]*JWT_SECRET[\s\S]*JWT_EXPIRATION/,
    );
  });
});
