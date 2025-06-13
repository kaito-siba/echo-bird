# Echo Bird Server

Echo Bird プロジェクトのバックエンドサーバーです。FastAPI と Tortoise ORM を使用して Twitter のツイートデータを管理します。

## 📦 技術スタック

- **FastAPI 0.115+** - WebAPI フレームワーク
- **Tortoise ORM 0.21+** - 非同期 ORM
- **PostgreSQL** - リレーショナルデータベース
- **Aerich 0.7+** - マイグレーションツール
- **Python 3.11** - ランタイム
- **uv** - パッケージマネージャー
- **Ruff** - リンター・フォーマッター
- **Pyright** - 型チェック

## 🏗️ プロジェクト構造

```
app/
├── main.py           # FastAPI アプリケーションエントリーポイント
├── database.py       # データベース接続設定
├── models.py         # Tortoise ORM モデル定義
└── api.py           # API エンドポイント定義

tests/               # テストファイル
migrations/          # Aerich マイグレーションファイル
scripts/            # ユーティリティスクリプト
```

## 🚀 セットアップ

### 依存関係のインストール

```bash
cd apps/server
uv install
```

### データベースの準備

PostgreSQL データベース `echo_bird` を作成し、環境変数を設定：

```bash
export DATABASE_URL="postgres://user:password@localhost:5432/echo_bird"
```

### データベースの初期化

```bash
# データベースとテーブルを作成し、adminユーザーを自動作成
uv run scripts/init_db.py
```

**管理者ユーザーの設定**

環境変数で管理者アカウントをカスタマイズできます：

```bash
export ADMIN_USERNAME="your_admin"     # デフォルト: admin
export ADMIN_PASSWORD="your_password"  # デフォルト: admin123
uv run scripts/init_db.py
```

### マイグレーションの実行（手動管理の場合）

```bash
aerich init-db      # 初回のみ
aerich upgrade      # マイグレーション実行
```

### サーバーの起動

```bash
fastapi dev app/main.py
```

サーバーは `http://localhost:8000` で起動します。

## 📡 API エンドポイント

### ツイート関連

- `GET /api/v1/tweets` - ツイート一覧取得（フィルタリング・検索対応）
- `POST /api/v1/tweets/read/{tweet_id}` - 既読状態更新
- `POST /api/v1/tweets/bookmark/{tweet_id}` - ブックマーク操作
- `GET /api/v1/tweets/bookmarked` - ブックマーク一覧取得

### その他

- `GET /` - Hello World
- `GET /health` - ヘルスチェック
- `GET /docs` - API ドキュメント (Swagger UI)
- `GET /redoc` - API ドキュメント (ReDoc)

## 🗄️ データベースモデル

### User モデル

Twitter ユーザーのプロフィール情報を管理（ユーザー名、表示名、プロフィール画像等）

### Tweet モデル

ツイートデータと既読・ブックマーク状態を管理（内容、エンゲージメント、投稿日時等）

詳細なデータベース設計については [プロジェクトルートの設計書](../../docs/specification.md) を参照してください。

## 🔧 開発コマンド

```bash
# マイグレーション
aerich migrate --name description    # マイグレーションファイル生成
aerich upgrade                       # マイグレーション実行
aerich history                       # マイグレーション履歴確認

# テスト
pytest                              # テスト実行
pytest --cov=app                    # カバレッジ付きテスト

# 品質管理
ruff check app/                     # リンティング
ruff format app/                    # フォーマット
pyright app/                        # 型チェック
```

## 🚀 デプロイ

### 環境変数

本番環境では以下の環境変数を設定：

```bash
DATABASE_URL=postgres://user:password@db:5432/echo_bird
SECRET_KEY=your-secret-key
DEBUG=false
```

### Docker デプロイ

```bash
# Dockerfile を使用してコンテナビルド・実行
docker build -t echo-bird-server .
docker run -p 8000:8000 echo-bird-server
```

## 🧪 テスト

- **単体テスト**: 各 API エンドポイントの機能テスト
- **統合テスト**: データベースとの連携テスト
- **E2E テスト**: フロントエンドとの結合テスト

テスト実行時は専用のテストデータベースを使用します。

## 🤝 コントリビューション

1. 新機能・バグ修正の Issue 作成
2. フィーチャーブランチで開発
3. テスト追加・更新
4. `ruff check && ruff format && pyright` でコード品質確認
5. Pull Request 作成

## 📚 参考資料

- [FastAPI ドキュメント](https://fastapi.tiangolo.com/)
- [Tortoise ORM ドキュメント](https://tortoise.github.io/)
- [Aerich ドキュメント](https://github.com/tortoise/aerich)
- [PostgreSQL ドキュメント](https://www.postgresql.org/docs/)
