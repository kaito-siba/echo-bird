# Echo Bird

Echo Bird は、Twitter の非公開リストのツイートを取得し、Twitter 風の Web アプリケーションで表示・操作するシステムです。

## 📋 概要

本システムは、Twitter Web API を使用してプライベートリストのツイートを取得し、React 製のモダンなフロントエンドでツイートの閲覧、フィルタリング、ブックマーク機能などを提供します。

## ✨ 主な機能

### 📥 ツイート取得機能

- Twitter の非公開リストからツイートを自動取得
- 以下のデータを取得・保存：
  - ツイート本文
  - アカウント情報（名前、URL、アイコン）
  - エンゲージメント（いいね数、リツイート数）
  - 投稿日時

### 🎨 フロントエンド機能

- **Twitter 風 UI**: モダンで直感的なインターフェース
- **フィルタリング**: 投稿期間、キーワード検索
- **ソート機能**: いいね数順、リツイート数順
- **既読管理**: 既読ツイートは透明度を下げて表示
- **ブックマーク**: お気に入りツイートの保存・管理

### 🔮 将来の機能（予定）

- 音声読み上げ機能（Web Speech API）
- ツイート要約機能（LLM/sumy）

## 🏗️ システム構成

```
echo-bird/
├── apps/
│   ├── client/          # React フロントエンド
│   └── server/          # FastAPI バックエンド
├── docs/
│   └── specification.md # 詳細仕様書
├── Taskfile.yml         # タスクランナー設定
└── mise.toml           # 開発環境設定
```

### 📦 技術スタック

| 要素               | 技術                                      |
| ------------------ | ----------------------------------------- |
| **フロントエンド** | React 19 + Vite + TailwindCSS             |
| **バックエンド**   | FastAPI + Python 3.11                     |
| **データベース**   | PostgreSQL                                |
| **スクレイピング** | Twitter Web API (tweepy-authlib)          |
| **ツールチェーン** | Task (Task runner), mise (env management) |

## 🚀 セットアップ

### 前提条件

- Node.js 22+
- Python 3.11
- PostgreSQL
- [mise](https://mise.jdx.dev/) (推奨)

### 1. 開発環境の準備

```bash
# mise を使用する場合
mise install

# または手動でインストール
# Node.js 22, Python 3.11, pnpm, uv, task を個別にインストール
```

### 2. プロジェクトのクローン

```bash
git clone https://github.com/your-username/echo-bird.git
cd echo-bird
```

### 3. 依存関係のインストール

```bash
task install
```

### 4. 開発サーバーの起動

```bash
task dev
```

これにより以下が起動します：

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8000

## 🔧 開発コマンド

### 📦 インストール

```bash
task install          # 全ての依存関係をインストール
task install:client   # フロントエンドのみ
task install:server   # バックエンドのみ
```

### 💻 開発

```bash
task dev              # 開発サーバー起動（フロント・バック両方）
task dev:client       # フロントエンドのみ
task dev:server       # バックエンドのみ
```

### 🏗️ ビルド

```bash
task build            # プロダクションビルド
task build:client     # フロントエンドのみ
```

### 🔍 品質管理

```bash
task lint             # リンティング実行
task format           # コードフォーマット
task test             # テスト実行
task type-check       # 型チェック
```

### 🧹 クリーンアップ

```bash
task clean            # ビルド成果物とキャッシュを削除
```

## 📡 API エンドポイント

| メソッド | エンドポイント                                      | 説明                   |
| -------- | --------------------------------------------------- | ---------------------- |
| `GET`    | `/tweets`                                           | ツイート一覧取得       |
| `GET`    | `/tweets?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | 期間フィルタリング     |
| `GET`    | `/tweets?search=keyword`                            | キーワード検索         |
| `POST`   | `/tweets/read/{tweet_id}`                           | 既読状態更新           |
| `POST`   | `/tweets/bookmark/{tweet_id}`                       | ブックマーク追加・削除 |

## 🗄️ データベース設計

PostgreSQL を使用したリレーショナルデータベース設計。

- **users テーブル**: Twitter ユーザー情報を管理
- **tweets テーブル**: ツイート情報を管理（users テーブルと外部キー制約で関連付け）

詳細なスキーマ情報については [docs/specification.md](docs/specification.md) をご参照ください。

## 🔄 データフロー

1. **ツイート取得**: Twitter Web API を使用してプライベートリストからツイートを取得
2. **データ保存**: PostgreSQL にツイートデータを保存
3. **フロントエンド表示**: React アプリでツイートを表示・操作
4. **ユーザー操作**: フィルタリング、ソート、ブックマーク等の機能

## 🛠️ 開発情報

### プロジェクト構造

```
apps/client/
├── src/              # React ソースコード
├── public/           # 静的ファイル
└── package.json      # フロントエンド依存関係

apps/server/
├── src/              # FastAPI ソースコード
├── tests/            # テストファイル
└── pyproject.toml    # バックエンド依存関係
```

### 使用ライブラリ

**フロントエンド:**

- React 19 (UI フレームワーク)
- TanStack Router (ルーティング)
- TanStack Query (データ取得)
- TailwindCSS (スタイリング)
- Biome (リンター・フォーマッター)

**バックエンド:**

- FastAPI (Web フレームワーク)
- Ruff (リンター・フォーマッター)
- pytest (テストフレームワーク)
- Pyright/MyPy (型チェック)

## 📄 ライセンス

[ライセンス情報を記載]

## 🤝 コントリビューション

コントリビューションを歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## 📖 詳細仕様

詳細な仕様については [docs/specification.md](docs/specification.md) をご参照ください。
