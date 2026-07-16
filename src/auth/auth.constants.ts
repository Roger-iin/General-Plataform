import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}
