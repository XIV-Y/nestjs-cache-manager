import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DiskCacheInterceptor } from 'src/common/interceptors/disk-cache.interceptor';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ProductsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DiskCacheInterceptor,
    },
  ],
})
export class AppModule { }
