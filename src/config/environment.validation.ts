export type JwtExpiration = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w'}`;

export interface ValidatedEnvironment extends Record<string, unknown> {
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: JwtExpiration;
}

const JWT_EXPIRATION_PATTERN = /^(\d+)(ms|s|m|h|d|w)$/;
const MINIMUM_JWT_EXPIRATION_MS = 60_000;
const MAXIMUM_JWT_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1_000;
const UNIT_IN_MILLISECONDS = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 60 * 60_000,
  d: 24 * 60 * 60_000,
  w: 7 * 24 * 60 * 60_000,
} as const;

function readRequiredString(
  environment: Record<string, unknown>,
  name: string,
  errors: string[],
): string {
  const value = environment[name];

  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${name} é obrigatória e não pode estar vazia.`);
    return '';
  }

  return value.trim();
}

function parsePort(value: string, errors: string[]): number {
  const port = Number(value);

  if (
    !/^\d+$/.test(value) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    errors.push('DB_PORT deve ser um número inteiro entre 1 e 65535.');
  }

  return port;
}

function parseJwtExpiration(value: string, errors: string[]): JwtExpiration {
  const match = JWT_EXPIRATION_PATTERN.exec(value);

  if (!match) {
    errors.push(
      'JWT_EXPIRATION deve usar um número positivo seguido de ms, s, m, h, d ou w (ex.: 15m ou 1d).',
    );
    return '1d';
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_IN_MILLISECONDS;
  const durationInMilliseconds = amount * UNIT_IN_MILLISECONDS[unit];

  if (
    !Number.isSafeInteger(durationInMilliseconds) ||
    durationInMilliseconds < MINIMUM_JWT_EXPIRATION_MS ||
    durationInMilliseconds > MAXIMUM_JWT_EXPIRATION_MS
  ) {
    errors.push('JWT_EXPIRATION deve estar entre 1 minuto e 30 dias.');
  }

  return value as JwtExpiration;
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): ValidatedEnvironment {
  const errors: string[] = [];
  const dbHost = readRequiredString(environment, 'DB_HOST', errors);
  const dbPort = parsePort(
    readRequiredString(environment, 'DB_PORT', errors),
    errors,
  );
  const dbUser = readRequiredString(environment, 'DB_USER', errors);
  const dbPass = readRequiredString(environment, 'DB_PASS', errors);
  const dbName = readRequiredString(environment, 'DB_NAME', errors);
  const jwtSecret = readRequiredString(environment, 'JWT_SECRET', errors);
  const jwtExpiration = parseJwtExpiration(
    readRequiredString(environment, 'JWT_EXPIRATION', errors),
    errors,
  );

  if (jwtSecret.length > 0 && jwtSecret.length < 64) {
    errors.push('JWT_SECRET deve possuir pelo menos 64 caracteres.');
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuração de ambiente inválida:\n- ${errors.join('\n- ')}`,
    );
  }

  return {
    ...environment,
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_USER: dbUser,
    DB_PASS: dbPass,
    DB_NAME: dbName,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRATION: jwtExpiration,
  };
}
