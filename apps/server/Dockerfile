# Server用のDockerfile
# Python 3.11を使用してFastAPI + Tortoise ORMアプリケーションを実行

FROM python:3.11-slim

# uvをインストール
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 作業ディレクトリを設定
WORKDIR /app

# Python環境を設定
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# pyproject.tomlとuv.lockをコピー
COPY pyproject.toml uv.lock ./

# 依存関係をインストール
RUN uv sync --frozen --no-install-project --no-dev

# ソースコードをコピー
COPY . .

# プロジェクトをインストール
RUN uv sync --frozen --no-dev

# ポート8000を公開
EXPOSE 8000

# FastAPIサーバーを起動
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]