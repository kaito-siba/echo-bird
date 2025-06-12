# Echo Bird Server

Echo Bird プロジェクトのバックエンドサーバーです。FastAPI と Tortoise ORM を使用して Twitter のツイートデータを管理します。

## 技術スタック

- **Web フレームワーク**: FastAPI
- **ORM**: Tortoise ORM
- **データベース**: PostgreSQL
- **マイグレーション**: Aerich

## セットアップ

### 1. 依存関係のインストール

```bash
# プロジェクトルートから
cd apps/server
uv install
```

### 2. データベースの準備

PostgreSQL データベース `echo_bird` を作成してください。

```sql
CREATE DATABASE echo_bird;
```

### 3. 環境変数の設定

環境変数でデータベース接続文字列を設定できます：

```bash
export DATABASE_URL="postgres://username:password@localhost:5432/echo_bird"
```

または、デフォルト設定（`postgres://postgres:password@localhost:5432/echo_bird`）を使用することもできます。

### 4. マイグレーションの初期化

```bash
# マイグレーション環境の初期化
aerich init-db

# マイグレーションファイルの生成
aerich init-db
```

### 5. サーバーの起動

```bash
# 開発サーバーの起動
fastapi dev src/main.py

# または
uvicorn src.main:app --reload
```

サーバーは `http://localhost:8000` で起動します。

## API エンドポイント

### ツイート関連

- `GET /api/v1/tweets` - ツイート一覧取得

  - クエリパラメータ:
    - `start_date`: 開始日 (YYYY-MM-DD)
    - `end_date`: 終了日 (YYYY-MM-DD)
    - `search`: 検索キーワード
    - `sort_by`: ソート条件 (likes_count, retweets_count, posted_at)
    - `order`: ソート順序 (asc/desc)

- `POST /api/v1/tweets/read/{tweet_id}` - ツイートを既読にする
- `POST /api/v1/tweets/bookmark/{tweet_id}` - ブックマークの追加・削除
- `GET /api/v1/tweets/bookmarked` - ブックマーク一覧取得

### その他

- `GET /` - Hello World
- `GET /health` - ヘルスチェック
- `GET /docs` - API ドキュメント (Swagger UI)

## データベースモデル

### User モデル

- Twitter ユーザーのプロフィール情報を管理

### Tweet モデル

- ツイートデータと既読・ブックマーク状態を管理

詳細は設計書 (`docs/specification.md`) を参照してください。

## 開発

### マイグレーション

```bash
# モデル変更後のマイグレーションファイル生成
aerich migrate

# マイグレーション実行
aerich upgrade
```

### テスト実行

```bash
pytest
```

