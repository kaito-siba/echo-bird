# Echo Bird

Twitter のツイートデータを収集・管理し、効率的な情報収集を支援する Web アプリケーションです。

## 🎯 主な機能

- **ツイート収集・管理** - Twitter API を活用した自動収集システム
- **既読・ブックマーク** - 読んだツイートの管理とお気に入り機能
- **フィルタリング・検索** - 日付、キーワード、エンゲージメントでの絞り込み
- **レスポンシブ UI** - モバイル・デスクトップ両対応
- **要約・音声読み上げ** - AI 要約と音声での情報取得（予定）

## 🏗️ アーキテクチャ

### Frontend (Client)

- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性の確保
- **TanStack Router** - ファイルベースルーティング
- **TanStack Query** - サーバー状態管理
- **TanStack Store** - クライアント状態管理
- **Vanilla Extract** - 型安全なスタイリング
- **Vite** - 高速ビルドツール
- **Vitest** - テスティングフレームワーク
- **Biome** - リンター・フォーマッター

### Backend (Server)

- **FastAPI** - 高性能 WebAPI フレームワーク
- **Tortoise ORM** - 非同期 ORM
- **PostgreSQL** - リレーショナルデータベース
- **Aerich** - マイグレーションツール
- **Python 3.11** - ランタイム

### Infrastructure

- **モノレポ構成** - 複数アプリケーションの統合管理
- **pnpm** - Node.js パッケージマネージャー
- **uv** - Python パッケージマネージャー
- **Task** - タスクランナー
- **mise** - 開発環境管理
- **Docker** - データベースコンテナ化

## 🚀 クイックスタート

### 前提条件

- Node.js 22+
- Python 3.11
- Docker & Docker Compose
- [mise](https://mise.jdx.dev/) (推奨)

### セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/your-username/echo-bird.git
cd echo-bird

# 2. 開発環境準備
mise install

# 3. 依存関係インストール
task install

# 4. データベース起動
task db:up

# 5. データベース初期化
task db:migrate:init

# 6. 開発サーバー起動
task dev
```

**アクセス先:**

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

## 🔧 開発コマンド

```bash
# 依存関係
task install              # 全ての依存関係をインストール
task install:client       # フロントエンドのみ
task install:server       # バックエンドのみ

# データベース
task db:up                # データベース起動
task db:down              # データベース停止
task db:restart           # データベース再起動
task db:reset             # データベースリセット
task db:logs              # ログ表示
task db:shell             # データベースシェル接続
task db:status            # ステータス確認

# マイグレーション
task db:migrate           # マイグレーション実行
task db:migrate:init      # マイグレーション初期化
task db:migrate:create    # 新規マイグレーション作成
task db:migrate:history   # マイグレーション履歴

# 開発
task dev                  # 開発サーバー起動（両方）
task dev:full             # データベース起動 + 開発サーバー起動
task dev:client           # フロントエンドのみ
task dev:server           # バックエンドのみ

# ビルド・品質管理
task build                # プロダクションビルド
task lint                 # リンティング実行
task format               # コードフォーマット
task test                 # テスト実行
task clean                # キャッシュクリア
```

## 🗄️ データベース

### 設定

プロジェクトでは Docker を使用して PostgreSQL データベースを管理しています：

- **データベース名**: `echo_bird`
- **ユーザー**: `postgres`
- **パスワード**: `password`
- **ポート**: `5432`

### 初期セットアップ

```bash
# データベース起動
task db:up

# マイグレーション初期化（初回のみ）
task db:migrate:init

# マイグレーション実行
task db:migrate
```

### 便利なコマンド

```bash
# データベースに直接接続
task db:shell

# ログ監視
task db:logs

# データベース完全リセット
task db:reset
```

## 📚 詳細ドキュメント

- **[Client README](apps/client/README.md)** - React フロントエンドの詳細
- **[Server README](apps/server/README.md)** - FastAPI バックエンドの詳細
- **[設計書](docs/specification.md)** - システム設計・データベース設計

## 🧪 テスト駆動開発

このプロジェクトでは TDD を採用しています。新機能の実装前にテストを作成し、ビジネス要求を満たす最小限の実装から始めてください。

## 🤝 コントリビューション

1. Issue の作成・確認
2. フィーチャーブランチでの開発
3. テストの追加・更新
4. コード品質確認 (`task lint && task format && task type-check`)
5. Pull Request の作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
