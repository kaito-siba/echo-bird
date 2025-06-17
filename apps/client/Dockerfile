# Client用のDockerfile
# Node.js 22を使用してReact + TypeScriptアプリケーションをビルド・実行

FROM node:22-alpine AS base

# pnpmをインストール
RUN npm install -g pnpm

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpnpm-lock.yamlをコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

# 開発用のポート3000を公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]