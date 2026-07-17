import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(RateLimitGuard.name);

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      method?: string;
      originalUrl?: string;
    }>();

    this.logger.warn({
      event: 'rate_limit_exceeded',
      ip: request.ip ?? 'unknown',
      method: request.method ?? 'unknown',
      route: request.originalUrl?.split('?')[0] ?? 'unknown',
      limit: throttlerLimitDetail.limit,
      windowMs: throttlerLimitDetail.ttl,
    });

    await super.throwThrottlingException(context, throttlerLimitDetail);
  }
}
