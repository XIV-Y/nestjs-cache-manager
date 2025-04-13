import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
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

    console.log(`Cache Miss!!: ${request.url}`);

    try {
      // キャッシュにない場合はハンドラを実行し、結果をキャッシュに保存
      return next.handle().pipe(
        map(async (response) => {
          const ttl = this.getTtlForRequest();

          await this.cacheManager.set(cacheKey, response, ttl);
        }),
      );
    } catch (e) {
      console.error(e);
    }
  }

  // 実際に使用する際はユーザーIDなど外部に依存しない情報を使用してキャッシュキーを生成すること
  private generateCacheKey(request: Request): string {
    const baseUrl = request.baseUrl + request.path;
    const queryParams = request.query ? JSON.stringify(request.query) : '';
    const authHeader = request.headers.authorization || '';

    const dataToHash = `${baseUrl}|${queryParams}|${authHeader}`;

    return `api-cache:${crypto.createHash('md5').update(dataToHash).digest('hex')}`;
  }

  private getTtlForRequest(): number {
    return 30 * 1000; // ミリ秒指定
  }
}
