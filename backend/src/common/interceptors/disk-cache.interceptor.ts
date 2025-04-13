import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class DiskCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<Request>();

    if (request.method !== 'GET') return next.handle();

    const cacheKey = this.generateCacheKey(request);

    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      console.log(`Cache Hit!!: ${request.url}`);

      return of(cachedResponse);
    }

    console.log(`Cache miss for: ${request.url}`);

    // キャッシュにない場合はハンドラを実行し、結果をキャッシュに保存
    return next.handle().pipe(
      tap((response) => {
        const ttl = this.getTtlForRequest(request);

        this.cacheManager.set(cacheKey, response, ttl);
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const baseUrl = request.baseUrl + request.path;
    const queryParams = request.query ? JSON.stringify(request.query) : '';
    const authHeader = request.headers.authorization || '';

    const dataToHash = `${baseUrl}|${queryParams}|${authHeader}`;

    return `api-cache:${crypto.createHash('md5').update(dataToHash).digest('hex')}`;
  }

  private getTtlForRequest(request: Request): number {
    // パスに基づいて異なるTTLを設定
    if (request.path.startsWith('/api/products')) {
      return 1800;
    }

    return 3600;
  }
}
