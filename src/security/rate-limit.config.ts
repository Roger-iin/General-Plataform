import { createHash } from 'node:crypto';

interface RateLimitRequest {
  body?: unknown;
  ip?: string;
  socket?: { remoteAddress?: string };
}

function getRequestIp(request: RateLimitRequest): string {
  return request.ip ?? request.socket?.remoteAddress ?? 'unknown';
}

export function getIpTracker(request: RateLimitRequest): string {
  return getRequestIp(request);
}

export function getCredentialTracker(request: RateLimitRequest): string {
  const ip = getRequestIp(request);
  const body = request.body;

  if (!body || typeof body !== 'object' || !('email' in body)) {
    return `${ip}:anonymous`;
  }

  const email = (body as { email?: unknown }).email;

  if (typeof email !== 'string') {
    return `${ip}:anonymous`;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');

  return `${ip}:${emailHash}`;
}
