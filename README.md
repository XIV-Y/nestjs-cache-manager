Nest.js で cache-manager を使用したサーバーサイドキャッシュの実装デモです。

## 概要

このプロジェクトは、Nest.js の cache-manager を使用してAPI レスポンスをメモリにキャッシュし、重い処理を伴うエンドポイントのパフォーマンスを向上させるデモアプリケーションです。

### 実装内容

- **グローバルキャッシュインターセプター**: 全GETリクエストに自動的にキャッシュを適用
- **TTL管理**: 30秒間のキャッシュ有効期限
- **自動キャッシュキー生成**: URL、クエリパラメータ、認証ヘッダーからMD5ハッシュを生成
- **重い処理のシミュレーション**: 10秒の処理時間をシミュレートして効果を実感

## 環境構築

```bash
# リポジトリをクローン
git clone <repository-url>
cd <project-directory>

# Docker でアプリケーションを起動
docker-compose up --build
```

## 動作確認

### 1. APIエンドポイントにアクセス

```bash
curl http://localhost:3001/api/products
```

### 2. キャッシュ動作の確認

1. **初回リクエスト**
   - 約10秒の応答時間
   - コンソールに「Cache Miss!!」が表示

2. **2回目のリクエスト（30秒以内）**
   - 即座に応答
   - コンソールに「Cache Hit!!」が表示

3. **30秒経過後のリクエスト**
   - 再び10秒の応答時間
   - キャッシュが期限切れになり再生成

### 3. 実際の動作例

```bash
# 1回目: 10秒待機（Cache Miss）
$ time curl http://localhost:3001/api/products
real    0m10.123s

# 2回目: 即座に応答（Cache Hit）
$ time curl http://localhost:3001/api/products  
real    0m0.045s
```
