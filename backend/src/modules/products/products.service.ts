import { Injectable } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  updatedAt: string;
}

@Injectable()
export class ProductsService {
  async findAll() {
    // 重い処理をシミュレーション
    await this.sleep(10000);

    return this.products;
  }

  private products: Product[] = [
    {
      id: 1,
      name: '高品質ノートパソコン',
      price: 120000,
      stock: 15,
      description: 'ビジネス利用に最適な高性能ノートパソコン',
      updatedAt: '2025-04-09T10:16:09.088Z',
    },
    {
      id: 2,
      name: 'ワイヤレスイヤホン',
      price: 15000,
      stock: 42,
      description: 'ノイズキャンセリング機能搭載の高音質イヤホン',
      updatedAt: '2025-04-09T10:16:09.088Z',
    },
    {
      id: 3,
      name: 'スマートウォッチ',
      price: 25000,
      stock: 28,
      description: '健康管理と通知機能を備えた最新スマートウォッチ',
      updatedAt: '2025-04-09T10:16:09.088Z',
    },
  ];

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
