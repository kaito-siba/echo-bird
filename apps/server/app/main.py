from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

from app.constants import (
    API_RESPONSE_HEALTH_OK,
    API_RESPONSE_HELLO,
    APP_NAME,
    APP_VERSION,
)
from app.database import close_db, init_db
from app.routers import auth, users


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # 起動時の処理
    await init_db()
    yield
    # 終了時の処理
    await close_db()


app = FastAPI(lifespan=lifespan, title=APP_NAME, version=APP_VERSION)

# ルーターを登録
app.include_router(auth.router)
app.include_router(users.router)


@app.get('/')
async def root() -> dict[str, Any]:
    return {'message': API_RESPONSE_HELLO}


@app.get('/health')
async def health_check() -> dict[str, str]:
    return {'status': API_RESPONSE_HEALTH_OK}
