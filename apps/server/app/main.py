import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.constants import (
    API_RESPONSE_HEALTH_OK,
    API_RESPONSE_HELLO,
    APP_NAME,
    APP_VERSION,
)
from app.database import close_db, init_db
from app.routers import (
    auth,
    media,
    target_accounts,
    timelines,
    tweets,
    twitter_auth,
    users,
)
from app.services.tweet_scheduler import TweetScheduler
from app.utils.s3_client import initialize_media_bucket

# グローバルなスケジューラーインスタンス
tweet_scheduler = TweetScheduler()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # 起動時の処理
    await init_db()
    # MinIO メディアバケットを初期化
    await initialize_media_bucket()
    # スケジューラーを開始
    await tweet_scheduler.start()
    yield
    # 終了時の処理
    await tweet_scheduler.stop()
    await close_db()


app = FastAPI(lifespan=lifespan, title=APP_NAME, version=APP_VERSION)

# CORS設定 - 開発環境用（ローカル・Docker対応）
allowed_origins = [
    'http://localhost:5173',  # Vite開発サーバー（ローカル）
    'http://127.0.0.1:5173',
    'http://localhost:3000',  # Docker環境でのClient
    'http://127.0.0.1:3000',
]

# 環境変数で追加のオリジンを指定可能
if cors_origins := os.environ.get('CORS_ORIGINS'):
    allowed_origins.extend(cors_origins.split(','))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ルーターを登録
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(twitter_auth.router)
app.include_router(target_accounts.router)
app.include_router(timelines.router)
app.include_router(tweets.router)
app.include_router(media.router)


@app.get('/api/v1/')
async def root() -> dict[str, Any]:
    return {'message': API_RESPONSE_HELLO}


@app.get('/api/v1/health')
async def health_check() -> dict[str, str]:
    return {'status': API_RESPONSE_HEALTH_OK}
