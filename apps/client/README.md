# Echo Bird Client

Echo Bird プロジェクトのフロントエンドアプリケーションです。React 19 をベースに、最新のモダンな技術スタックで構築された Twitter 風 UI を提供します。

## 📦 技術スタック

- **React 19** - UI フレームワーク
- **TanStack Router** - ファイルベースの型安全ルーティング
- **TanStack Query** - データフェッチング・キャッシュ・状態管理
- **Vanilla Extract** - 型安全な CSS-in-TypeScript
- **Vitest** - 高速テストフレームワーク
- **TypeScript** - 型安全な JavaScript
- **Biome** - 高速リンター・フォーマッター
- **Vite** - 高速開発サーバー・ビルドツール

## 🏗️ プロジェクト構造

```
src/
├── routes/                    # ファイルベースルーティング
├── components/               # 再利用可能コンポーネント
├── styles/                  # グローバルスタイル・テーマ
├── integrations/            # 外部ライブラリ統合
├── lib/                     # ユーティリティ関数
└── __tests__/               # テストファイル
```

## 🚀 セットアップ

### 依存関係のインストール

```bash
cd apps/client
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは `http://localhost:3000` で起動します。

### ビルド

```bash
pnpm build      # プロダクションビルド
pnpm serve      # ビルド結果をプレビュー
```

## 🧪 テスト

```bash
pnpm test           # テスト実行
pnpm test:watch     # ウォッチモード
pnpm test:ui        # UI 付きテスト
```

テストは `src/__tests__/` ディレクトリに配置し、Vitest と React Testing Library を使用します。

## 🎨 スタイリング

Vanilla Extract を使用した型安全な CSS-in-TypeScript：

- **スタイル定義**: `.css.ts` ファイルで作成
- **テーマシステム**: `src/styles/theme.css.ts` で統一管理
- **グローバルスタイル**: `src/styles/global.css.ts` で定義

## 🛣️ ルーティング

TanStack Router によるファイルベースルーティング：

- `src/routes/` ディレクトリの構造がそのままルートになる
- 型安全なナビゲーションとデータローディング
- 自動コード分割によるパフォーマンス最適化

## 📡 データフェッチング

TanStack Query を使用：

- サーバー状態の管理とキャッシュ
- 楽観的更新とエラーハンドリング
- ルートレベルでのデータプリロード対応

## 🔧 開発コマンド

```bash
# 開発
pnpm dev                    # 開発サーバー起動
pnpm build                  # プロダクションビルド
pnpm serve                  # ビルド結果をプレビュー

# テスト
pnpm test                   # テスト実行
pnpm test:watch             # ウォッチモード
pnpm test:ui                # UI 付きテスト

# 品質管理
pnpm lint                   # リンティング
pnpm format                 # フォーマット
pnpm check                  # リント＋フォーマット
```

## 🤝 コントリビューション

1. 機能ブランチを作成
2. 機能実装・テスト追加
3. `pnpm check` でコード品質確認
4. Pull Request 作成

### コーディング規約

- **コンポーネント**: PascalCase (`MyComponent.tsx`)
- **スタイル**: camelCase (`.css.ts` ファイル内)
- **ファイル**: kebab-case (`my-component.tsx`)

## 📚 参考資料

- [React ドキュメント](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Vanilla Extract](https://vanilla-extract.style/)
- [Vitest](https://vitest.dev/)
